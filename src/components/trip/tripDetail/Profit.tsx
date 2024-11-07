import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { IExpense, TripExpense } from '@/utils/interface';
import ProfitItem from './Profit/ProfitItem';
import { DeleteExpense, handleAddExpense, handleEditExpense } from '@/helpers/ExpenseOperation';
import { Button } from '@/components/ui/button';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { formatNumber } from '@/utils/utilArray';
import dynamic from 'next/dynamic';

interface ProfitProps {
  charges: TripExpense[];
  amount: number;
  setCharges: React.Dispatch<React.SetStateAction<TripExpense[]>>;
  tripId: string;
  driverId: string;
  truckNo: string;
  truckCost?: number;
  tripExpense: IExpense[];
}

const Profit: React.FC<ProfitProps> = ({ charges, amount, setCharges, tripId, driverId, truckNo, truckCost = 0, tripExpense }) => {
  const [showTotalCharges, setShowTotalCharges] = useState(false);
  const [showTotalDeductions, setShowTotalDeductions] = useState(false);
  const [showTruckExpenses, setShowTruckExpenses] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [truckExpenses, setTruckExpenses] = useState<IExpense[]>(tripExpense);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);

  const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), { ssr: false });

  // Memoize calculations to avoid unnecessary recalculations
  const totalChargesAmount = useMemo(
    () => charges.filter(charge => charge.partyBill).reduce((total, charge) => total + Number(charge.amount || 0), 0),
    [charges]
  );

  const totalDeductionsAmount = useMemo(
    () => charges.filter(charge => !charge.partyBill).reduce((total, charge) => total + Number(charge.amount || 0), 0),
    [charges]
  );

  const truckExpensesAmount = useMemo(
    () => truckExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [truckExpenses]
  );

  const netProfit = useMemo(() => {
    return Number(amount) + totalChargesAmount - totalDeductionsAmount - truckExpensesAmount - Number(truckCost || 0);
  }, [amount, totalChargesAmount, totalDeductionsAmount, truckExpensesAmount, truckCost]);

  // Handlers
  const handleExpense = useCallback(
    async (editedExpense: IExpense) => {
      try {
        if (selectedExpense) {
          const expense = await handleEditExpense(editedExpense, selectedExpense.id);
          setTruckExpenses(prev => prev.map(item => (item.id === expense.id ? expense : item)));
        } else {
          const expense = await handleAddExpense(editedExpense);
          setTruckExpenses(prev => [expense, ...prev]);
        }
      } catch (error) {
        alert('Failed to perform expense operation');
        console.error(error);
      }
    },
    [selectedExpense]
  );

  const handleDeleteExpense = useCallback(async (id: string) => {
    try {
      const deletedExpense = await DeleteExpense(id);
      if (deletedExpense) {
        setTruckExpenses(prev => prev.filter(item => item.id !== deletedExpense.id));
      }
    } catch (error) {
      alert('Failed to delete expense');
      console.error(error);
    }
  }, []);

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
          +₹{formatNumber(totalChargesAmount)}
          {showTotalCharges ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTotalCharges && charges.filter(charge => charge.partyBill).map((charge, index) => (
        <ProfitItem data={charge} index={index} key={charge.id as string} disabled={true} sign="+" />
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTotalDeductions(!showTotalDeductions)}>
        <span className="font-medium text-gray-700">Total Deductions</span>
        <span className="flex items-center text-red-600 font-semibold">
          -₹{formatNumber(totalDeductionsAmount)}
          {showTotalDeductions ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTotalDeductions && charges.filter(charge => !charge.partyBill).map((charge, index) => (
        <ProfitItem data={charge} index={index} key={charge.id as string} disabled={true} sign="-" />
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors rounded-md" onClick={() => setShowTruckExpenses(!showTruckExpenses)}>
        <span className="font-medium text-gray-700">Expenses</span>
        <span className="flex items-center text-red-600 font-semibold">
          -₹{formatNumber(truckExpensesAmount)}
          {showTruckExpenses ? <FaChevronUp className="ml-2 transition-transform" /> : <FaChevronDown className="ml-2 transition-transform" />}
        </span>
      </div>
      {showTruckExpenses && truckExpenses.map((expense, index) => (
        <ProfitItem data={expense} handleDelete={handleDeleteExpense} index={index} key={expense.id as string} setOpen={setIsModalOpen} setSelectedExpense={setSelectedExpense} sign="-" />
      ))}

      {truckCost > 0 && (
        <div className="py-4 mt-4 flex justify-between items-center">
          <span className="font-medium text-gray-800">Truck Hire Cost: </span>
          <span className="text-red-600 font-bold">-₹{formatNumber(truckCost)}</span>
        </div>
      )}

      <hr />
      <div className="py-4 mt-4 flex justify-between items-center">
        <span className="font-medium text-gray-800">Net Profit: </span>
        <span className="text-blue-700 font-bold">₹{formatNumber(netProfit)}</span>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Add Expense
        </Button>
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleExpense}
        driverId={driverId}
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']}
        tripId={tripId}
        truckNo={truckNo}
        selected={selectedExpense}
      />
    </div>
  );
};

export default Profit;
