import React, { SetStateAction, useState } from 'react';
import { TripExpense } from '@/utils/interface';
import ExpenseModal from './ExpenseModal';

interface ProfitProps {
  charges: TripExpense[];
  amount: number;
  setCharges : any
  tripId : string
}



const Profit: React.FC<ProfitProps> = ({ charges, amount, setCharges, tripId }) => {
  const [showExpense, setShowExpenses] = useState<boolean>(false);
  const [showRevenue, setShowRevenuee] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAddCharge = async (newCharge: TripExpense) => {
    const res = await fetch(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCharge),
    });
    const data = await res.json();
    setCharges((prev: TripExpense[]) => [...prev, data.newCharge]);
  };

  let chargeToBill: TripExpense[] = [];
  let chargeNotToBill: TripExpense[] = [];

  if (charges) {
    chargeToBill = charges.filter(charge => charge.partyBill);
    chargeNotToBill = charges.filter(charge => !charge.partyBill);
  }

  const revenue = amount + chargeToBill.reduce((total, charge) => total + charge.amount, 0);
  const expenses = chargeNotToBill.reduce((total, charge) => total + charge.amount, 0);
  const profit = revenue - expenses;

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 w-full hover:shadow-xl transition-shadow duration-300 relative">
      <h3 className="text-2xl font-semibold mb-6 text-center text-blue-800">Profit Summary (Rs)</h3>

      <div className="flex flex-row w-full items-center justify-between">
        <span className="text-md font-bold text-gray-800">Freight Amount: </span>
        <span className="text-md font-semibold text-blue-700">{amount.toFixed(2)}</span>
      </div>

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center" onClick={() => setShowRevenuee(!showRevenue)}>
        <span className="font-medium text-gray-700">Revenue</span>
        <span className="text-green-600 font-semibold">+{revenue.toFixed(2)}</span>
      </div>
      {showRevenue && chargeToBill.map((charge, index) => (
        <div key={index} className="flex items-center justify-between py-2 px-4 bg-blue-50 rounded-lg my-2">
          <div className='flex flex-row items-center justify-between w-full'>
            <p className="text-sm font-medium text-gray-900">{charge.expenseType}</p>
            <p className="text-xs text-gray-600">+{charge.amount.toFixed(2)}</p>
          </div>
        </div>
      ))}

      <div className="py-4 border-b border-gray-200 cursor-pointer flex justify-between items-center" onClick={() => setShowExpenses(!showExpense)}>
        <span className="font-medium text-gray-700">Expenses</span>
        <span className="text-red-600 font-semibold">-{expenses.toFixed(2)}</span>
      </div>
      {showExpense && chargeNotToBill.map((charge, index) => (
        <div key={index} className="flex items-center justify-between py-2 px-4 bg-red-50 rounded-lg my-2">
          <div className='flex flex-row items-center justify-between w-full'>
            <p className="text-sm font-medium text-gray-900">{charge.expenseType}</p>
            <p className="text-xs text-gray-600">-{charge.amount.toFixed(2)}</p>
          </div>
        </div>
      ))}

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
      />
    </div>
  );
};

export default Profit;
