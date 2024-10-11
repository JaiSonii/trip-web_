import React, { useEffect, useState } from 'react';
import { IDriver, IExpense, ITrip, TripExpense, TruckModel } from '@/utils/interface';
import ProfitItem from './Profit/ProfitItem';
import { DeleteExpense, handleAddCharge, handleAddExpense, handleEditExpense } from '@/helpers/ExpenseOperation';
import { Button } from '@/components/ui/button';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { formatNumber } from '@/utils/utilArray';
import dynamic from 'next/dynamic';

interface ProfitProps {
  charges: TripExpense[];
  amount: number;
  setCharges: any;
  tripId: string;
  driverId: string;
  truckNo: string;
  truckCost?: number
  tripExpense : IExpense[]
}

interface Expense {
  id?: string | undefined;
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string;
  partyAmount: number;
  paymentMode: string;
  transactionId: string;
  driver: string;
  shop_id : string
}

const Profit: React.FC<ProfitProps> = ({ charges, amount, setCharges, tripId, driverId, truckNo, truckCost, tripExpense }) => {
  const [showTotalCharges, setShowTotalCharges] = useState<boolean>(false);
  const [showTotalDeductions, setShowTotalDeductions] = useState<boolean>(false);
  const [showTruckExpenses, setShowTruckExpenses] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [truckExpenses, setTruckExpenses] = useState<IExpense[]>(tripExpense);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [chargesAmount, setChargesAmount] = useState<number>(0);
  const [deduction, setDeduction] = useState<number>(0);
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);
  const [totalCharges, setTotalCharges] = useState<any>([]);
  const [totalDeductions, setTotalDeductions] = useState<any>([]);
  const driver = driverId;

  const AddExpenseModal = dynamic(()=> import('@/components/AddExpenseModal'), {ssr : false})

  //Reduced API Call
  // useEffect(() => {
  //   const fetchExpenses = async () => {
  //     const res = await fetch(`/api/trips/${tripId}/truckExpense`);
  //     if (!res.ok) {
  //       alert('Error');
  //       return;
  //     }
  //     const data = await res.json();
  //     if (data.status === 500) {
  //       alert(data.message);
  //       return;
  //     }
  //     setTruckExpenses(data.charges);
  //   };
  //   fetchExpenses();
  // }, [tripId]);

  useEffect(() => {
    let totalChargesData: TripExpense[] = [];
    let totalDeductionsData: TripExpense[] = [];

    if (charges) {
      totalChargesData = charges.filter(charge => charge.partyBill);
      setTotalCharges(totalChargesData);
      totalDeductionsData = charges.filter(charge => !charge.partyBill);
      setTotalDeductions(totalDeductionsData);
    }

    const totalChargesAmount = totalChargesData.reduce((total, charge) => total + charge.amount, 0);
    setChargesAmount(totalChargesAmount);

    const totalDeductionsAmount = totalDeductionsData.reduce((total, charge) => total + charge.amount, 0);
    setDeduction(totalDeductionsAmount);

    const truckExpensesAmount = truckExpenses.reduce((total, expense) => total + expense.amount, 0);
    setExpenseAmount(truckExpensesAmount);

    const profit = amount + totalChargesAmount - totalDeductionsAmount - truckExpensesAmount - (truckCost ? truckCost : 0);
    setNetProfit(profit);
  }, [charges, truckExpenses, amount]);


  const handleExpense = async(editedExpense : IExpense)=>{
    try {
      if(selectedExpense){
        const expense: any = await handleEditExpense(editedExpense, selectedExpense._id)
        setTruckExpenses((prev)=>(
          prev.map((item)=>item._id === expense._id? expense : item)
        ))
      }else{
        const expense : any= handleAddExpense(editedExpense)
        setTruckExpenses((prev) => [
          expense, // new expense added at the beginning
          ...prev, // spread in the previous expenses
        ]);
        
      }
    } catch (error) {
      alert('Failed to perform expense operation')
      console.log(error)
    }
  }

  const handleDeleteExpense = async(id : string)=>{
    try {
      const expense = await DeleteExpense(id)
      if(expense){
        setTruckExpenses((prev) => prev.filter((item)=>item._id!== expense._id))
      }
    } catch (error) {
      alert('Failed to Delete Expense')
      console.log(error)
    }
  }

  return (
    <div className="p-6 border rounded-lg border-lightOrange shadow-lg bg-white w-full hover:shadow-lightOrangeButtonColor transition-shadow duration-300 relative">
      <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">Profit Summary (Rs)</h3>

      <div className="flex flex-row w-full items-center justify-between">
        <span className="text-md font-bold text-gray-800">Freight Amount: </span>
        <span className="text-md font-semibold text-blue-700">₹{formatNumber(amount)}</span>
      </div>

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTotalCharges(!showTotalCharges)}>
        <span className="font-medium text-gray-700">Total Charges</span>
        <span className="flex items-center text-green-600 font-semibold">
          +₹{formatNumber(chargesAmount)}
          {showTotalCharges ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTotalCharges && totalCharges.map((charge: any, index: number) => (
        <ProfitItem data={charge} index={index} key={charge._id as string} disabled={true} sign={'+'} />
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTotalDeductions(!showTotalDeductions)}>
        <span className="font-medium text-gray-700">Total Deductions</span>
        <span className="flex items-center text-red-600 font-semibold">
          -₹{formatNumber(deduction)}
          {showTotalDeductions ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTotalDeductions && totalDeductions.map((charge: any, index: number) => (
        <ProfitItem data={charge} index={index} key={charge._id as string} disabled={true} sign={'-'} />
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTruckExpenses(!showTruckExpenses)}>
        <span className="font-medium text-gray-700">Expenses</span>
        <span className="flex items-center text-red-600 font-semibold">
          -₹{formatNumber(expenseAmount)}
          {showTruckExpenses ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTruckExpenses && truckExpenses.map((expense, index) => (
        <ProfitItem data={expense} handleDelete={handleDeleteExpense} index={index} key={expense._id as string} setOpen={setIsModalOpen} setSelectedExpense={setSelectedExpense} sign={'-'} />
      ))}



      {truckCost != 0 &&
        <div className="py-4 mt-4 flex justify-between items-center">
          <span className="font-medium text-gray-800">Truck Hire Cost: </span>
          <span className="text-red-600 font-bold">-₹{formatNumber(truckCost as number)}</span>
        </div>
      }


      <hr />
      <div className="py-4 mt-4 flex justify-between items-center">
        <span className="font-medium text-gray-800">Net Profit: </span>
        <span className="text-blue-700 font-bold">₹{formatNumber(netProfit)}</span>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2  transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Add Expense
        </Button>
      </div>


      <AddExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleExpense}
        driverId={driver}
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']}     
        tripId={tripId} 
        truckNo={truckNo}
        selected={selectedExpense}
      />
    </div>
  );
};

export default Profit;
