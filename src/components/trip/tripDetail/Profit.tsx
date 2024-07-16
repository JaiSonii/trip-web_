import React, { useEffect, useState } from 'react';
import { TripExpense } from '@/utils/interface';
import ExpenseModal from './ExpenseModal';
import ProfitItem from './Profit/ProfitItem';
import { stringify as flattedStringify } from 'flatted';

interface ProfitProps {
  charges: TripExpense[];
  amount: number;
  setCharges: any;
  tripId: string;
  driverId: string;
  truckNo: string
}

interface Expense {
  id?: string | undefined
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
}

const Profit: React.FC<ProfitProps> = ({ charges, amount, setCharges, tripId, driverId, truckNo }) => {
  const [showTotalCharges, setShowTotalCharges] = useState<boolean>(false);
  const [showTotalDeductions, setShowTotalDeductions] = useState<boolean>(false);
  const [showTruckExpenses, setShowTruckExpenses] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [truckExpenses, setTruckExpenses] = useState<any[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
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

  const handleAddCharge = async (newCharge: Expense, id: string | undefined) => {
    const truckExpenseData = {
      expenseType: newCharge.expenseType,
      paymentMode: newCharge.paymentMode,
      transaction_id: newCharge.transactionId || '',
      driver: newCharge.driver || '',
      amount: newCharge.amount,
      date: newCharge.date,
      notes: newCharge.notes || '',
      truck: truckNo
    };
    if (id) {
      const res = await fetch(`/api/truckExpense/${id as string}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (data.status === 500) {
        alert(data.message)
        return;
      }
      setTruckExpenses((prev) => prev.filter((charge) => charge._id != id ))
    }
    const res = await fetch(`/api/trips/${tripId}/truckExpense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truckExpenseData),
    });
    if (!res.ok) {
      alert('Error');
      return;
    }
    const data = await res.json();
    if (data.status === 500 || data.status === 400) {
      alert(data.message);
      return;
    }
    setTruckExpenses((prev) => [...prev, data.newCharge]);



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
    }
  };

  let totalCharges: TripExpense[] = [];
  let totalDeductions: TripExpense[] = [];

  if (charges) {
    totalCharges = charges.filter(charge => charge.partyBill);
    totalDeductions = charges.filter(charge => !charge.partyBill);
  }

  const totalChargesAmount = totalCharges.reduce((total, charge) => total + charge.amount, 0);
  const totalDeductionsAmount = totalDeductions.reduce((total, charge) => total + charge.amount, 0);
  const truckExpensesAmount = truckExpenses.reduce((total, expense) => total + expense.amount, 0);
  const profit = amount + totalChargesAmount - totalDeductionsAmount - truckExpensesAmount;

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 w-full hover:shadow-xl transition-shadow duration-300 relative">
      <h3 className="text-2xl font-semibold mb-6 text-center text-blue-800">Profit Summary (Rs)</h3>

      <div className="flex flex-row w-full items-center justify-between">
        <span className="text-md font-bold text-gray-800">Freight Amount: </span>
        <span className="text-md font-semibold text-blue-700">{amount.toFixed(2)}</span>
      </div>

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center" onClick={() => setShowTotalCharges(!showTotalCharges)}>
        <span className="font-medium text-gray-700">Total Charges</span>
        <span className="text-green-600 font-semibold">+{totalChargesAmount.toFixed(2)}</span>
      </div>
      {showTotalCharges && totalCharges.map((charge, index) => (
        <ProfitItem data={charge} index={index} key={charge._id as string} disabled={true} sign={'+'}/>
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center" onClick={() => setShowTotalDeductions(!showTotalDeductions)}>
        <span className="font-medium text-gray-700">Total Deductions</span>
        <span className="text-red-600 font-semibold">-{totalDeductionsAmount.toFixed(2)}</span>
      </div>
      {showTotalDeductions && totalDeductions.map((charge, index) => (
        <ProfitItem data={charge} index={index} key={charge._id as string} disabled={true} sign={'-'}/>
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center" onClick={() => setShowTruckExpenses(!showTruckExpenses)}>
        <span className="font-medium text-gray-700">Truck Expenses</span>
        <span className="text-red-600 font-semibold">-{truckExpensesAmount.toFixed(2)}</span>
      </div>
      {showTruckExpenses && truckExpenses.map((expense, index) => (
        <ProfitItem data={expense} index={index} key={expense._id as string} setOpen={setIsModalOpen} setSelectedExpense={setSelectedExpense} sign={'-'}/>
      ))}

      <hr />
      <div className="py-4 mt-4 flex justify-between items-center">
        <span className="font-medium text-gray-800">Net Profit: </span>
        <span className="text-blue-700 font-bold">{profit.toFixed(2)}</span>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md shadow-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Add Expense
        </button>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCharge}
        driverId={driver}
        selected={selectedExpense}
      />
    </div>
  );
};

export default Profit;
