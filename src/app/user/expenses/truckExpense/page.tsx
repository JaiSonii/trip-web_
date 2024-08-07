'use client';
import Loading from '@/app/user/loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { IExpense } from '@/utils/interface';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MdDelete, MdEdit, MdLocalGasStation, MdPayment } from 'react-icons/md';
import { fetchTruckExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import DriverName from '@/components/driver/DriverName';
import { icons, IconKey } from '@/utils/icons';
import { FaCalendarAlt, FaTruck } from 'react-icons/fa';

const TruckExpense: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<IExpense[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<IExpense | null>(null);

  const searchParams = useSearchParams();
  const monthYear = searchParams.get('monthYear')?.split(' ');
  const [month, year] = monthYear ? monthYear : [null, null];

  const router = useRouter();

  const getBook = async () => {
    try {
      setLoading(true);
      const truckExpenses = await fetchTruckExpense(month, year);
      setMaintainenceBook(truckExpenses);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = async (expense: IExpense) => {
    try {
      await handleAddCharge(expense, expense.id);
      setModalOpen(false); // Close the modal after saving
      getBook();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (month && year) getBook();
  }, [month, year]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold mb-4">Truck Expenses</h1>
      <div className="table-container overflow-auto bg-white shadow rounded-lg">
        <table className="custom-table w-full border-collapse table-auto">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="border p-4 text-left">Date</th>
              <th className="border p-4 text-left">Amount</th>
              <th className="border p-4 text-left">Expense Type</th>
              <th className="border p-4 text-left">Payment Mode</th>
              <th className="border p-4 text-left">Notes</th>
              <th className="border p-4 text-left">Truck</th>
              <th className="border p-4 text-left">Driver</th>
              <th className="border p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook.length > 0 ? (
              maintainenceBook.map((expense, index) => (
                <tr key={index} className="border-t hover:bg-indigo-100 cursor-pointer transition-colors">
                  <td className="border p-4">
                    <div className='flex items-center space-x-2'>
                      <FaCalendarAlt className='text-bottomNavBarColor' />
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="border p-4">{expense.amount}</td>
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      {icons[expense.expenseType as IconKey]}
                      <span>{expense.expenseType}</span>
                    </div>
                  </td>
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      <MdPayment className="text-green-500" />
                      <span>{expense.paymentMode}</span>
                    </div>
                  </td>
                  <td className="border p-4">{expense.notes || 'N/A'}</td>

                  <td className="border p-4">
                    <div className='flex items-center space-x-2'>
                      <FaTruck className='text-bottomNavBarColor' />
                      <span>{expense.truck || ''}</span>
                    </div>
                  </td>
                  <td className="border p-4">{expense.driver ? <DriverName driverId={expense.driver as string} /> : 'N/A'}</td>
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={() => { setSelected(expense); setModalOpen(true); } } size="sm">
                        <MdEdit />
                      </Button>
                      <Button variant="destructive" onClick={async () => {
                        await handleDelete(expense._id as string);
                        setMaintainenceBook((prev) => prev.filter((item) => item._id !== expense._id));
                      }} size={"sm"}>
                        <MdDelete />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-500">No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && (
        <ExpenseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleEditExpense}
          driverId={selected.driver as string}
          selected={selected}
          truckPage={true}
        />
      )}
    </div>
  );
};

export default TruckExpense;
