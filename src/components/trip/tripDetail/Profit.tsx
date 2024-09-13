import React, { useEffect, useState } from 'react';
import { TripExpense } from '@/utils/interface';
import ExpenseModal from './ExpenseModal';
import ProfitItem from './Profit/ProfitItem';
import { handleAddCharge } from '@/helpers/ExpenseOperation';
import { Button } from '@/components/ui/button';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

interface ProfitProps {
  charges: TripExpense[];
  amount: number;
  setCharges: any;
  tripId: string;
  driverId: string;
  truckNo: string;
  truckCost?: number
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

const Profit: React.FC<ProfitProps> = ({ charges, amount, setCharges, tripId, driverId, truckNo, truckCost }) => {
  const [showTotalCharges, setShowTotalCharges] = useState<boolean>(false);
  const [showTotalDeductions, setShowTotalDeductions] = useState<boolean>(false);
  const [showTruckExpenses, setShowTruckExpenses] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [truckExpenses, setTruckExpenses] = useState<any[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [chargesAmount, setChargesAmount] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [totalCharges, setTotalCharges] = useState<any>([]);
  const [totalDeductions, setTotalDeductions] = useState<any>([]);
  const driver = driverId;

  useEffect(() => {
    const fetchExpenses = async () => {
      const res = await fetch(`/api/trips/${tripId}/truckExpense`);
      if (!res.ok) {
        alert('Error');
        return;
      }
      const data = await res.json();
      if (data.status === 500) {
        alert(data.message);
        return;
      }
      setTruckExpenses(data.charges);
    };
    fetchExpenses();
  }, [tripId]);

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

  const handleExpense = async (newCharge: Expense, id: string | undefined) => {
    const truckExpenseData = {
      expenseType: newCharge.expenseType,
      paymentMode: newCharge.paymentMode,
      transaction_id: newCharge.transactionId || '',
      driver: newCharge.paymentMode === 'Paid By Driver' ? newCharge.driver : '',
      amount: newCharge.amount,
      date: newCharge.date,
      notes: newCharge.notes || '',
      truck: truckNo,
      shop_id  : newCharge.shop_id || ''
    };

    if (id) {
      const result = await handleAddCharge(truckExpenseData, id, truckNo);
      const updatedCharge = result.charge;
      setTruckExpenses((prev) => prev.map((charge) => charge._id === updatedCharge._id ? updatedCharge : charge));
    } else {
      const res = await fetch(`/api/trips/${tripId}/truckExpense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckExpenseData),
      });
      const data = await res.json();
      setTruckExpenses(prev => [...prev, data.charge]);
    }

    if (newCharge.partyBill) {
      const chargesData = {
        partyBill: newCharge.partyBill,
        amount: newCharge.partyAmount,
        date: new Date(newCharge.date),
        expenseType: newCharge.expenseType,
        notes: newCharge.notes,
      };
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chargesData),
      });
      const data = await res.json();
      setCharges((prev: TripExpense[]) => [...prev, data.newCharge]);
      setTotalCharges((prev: TripExpense[]) => [...prev, data.newCharge]);
    }
  };

  return (
    <div className="p-6 border rounded-lg border-lightOrange shadow-lg bg-white w-full hover:shadow-lightOrangeButtonColor transition-shadow duration-300 relative">
      <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">Profit Summary (Rs)</h3>

      <div className="flex flex-row w-full items-center justify-between">
        <span className="text-md font-bold text-gray-800">Freight Amount: </span>
        <span className="text-md font-semibold text-blue-700">{amount.toFixed(2)}</span>
      </div>

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTotalCharges(!showTotalCharges)}>
        <span className="font-medium text-gray-700">Total Charges</span>
        <span className="flex items-center text-green-600 font-semibold">
          +{chargesAmount.toFixed(2)}
          {showTotalCharges ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTotalCharges && totalCharges.map((charge: any, index: number) => (
        <ProfitItem data={charge} index={index} key={charge._id as string} disabled={true} sign={'+'} />
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTotalDeductions(!showTotalDeductions)}>
        <span className="font-medium text-gray-700">Total Deductions</span>
        <span className="flex items-center text-red-600 font-semibold">
          -{deduction.toFixed(2)}
          {showTotalDeductions ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTotalDeductions && totalDeductions.map((charge: any, index: number) => (
        <ProfitItem data={charge} index={index} key={charge._id as string} disabled={true} sign={'-'} />
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTruckExpenses(!showTruckExpenses)}>
        <span className="font-medium text-gray-700">Expenses</span>
        <span className="flex items-center text-red-600 font-semibold">
          -{expenseAmount.toFixed(2)}
          {showTruckExpenses ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTruckExpenses && truckExpenses.map((expense, index) => (
        <ProfitItem data={expense} index={index} key={expense._id as string} setOpen={setIsModalOpen} setSelectedExpense={setSelectedExpense} sign={'-'} />
      ))}


      {truckCost != 0 &&
        <div className="py-4 mt-4 flex justify-between items-center">
          <span className="font-medium text-gray-800">Truck Hire Cost: </span>
          <span className="text-red-600 font-bold">-{truckCost}</span>
        </div>
      }


      <hr />
      <div className="py-4 mt-4 flex justify-between items-center">
        <span className="font-medium text-gray-800">Net Profit: </span>
        <span className="text-blue-700 font-bold">{netProfit.toFixed(2)}</span>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2  transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Add Expense
        </Button>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleExpense}
        driverId={driver}
        selected={selectedExpense}
      />
    </div>
  );
};

export default Profit;
