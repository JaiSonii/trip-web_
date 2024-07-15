import React from 'react';

interface ProfitProps {
  revenue: string;
  expenses: string;
  profit: string;
}

const Profit: React.FC<ProfitProps> = ({ revenue, expenses, profit }) => {
  return (
    <div className="mt-6 bg-white shadow p-6 rounded-md">
      <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Profit Summary</h3>
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="font-medium text-gray-600">Revenue</span>
        <span className="text-green-600 font-semibold">{revenue}</span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="font-medium text-gray-600">Expenses</span>
        <span className="text-red-600 font-semibold">{expenses}</span>
      </div>
      <div className="flex justify-between items-center py-2 mt-4">
        <span className="font-medium text-gray-700">Net Profit</span>
        <span className="text-blue-600 font-bold">{profit}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const demoRevenue = '$20,000';
  const demoExpenses = '$5,000';
  const demoProfit = '$15,000';

  return (
    <div className="p-4">
      <Profit revenue={demoRevenue} expenses={demoExpenses} profit={demoProfit} />
    </div>
  );
};

export default App;
