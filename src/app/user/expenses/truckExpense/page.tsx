'use client';
import Loading from '@/app/user/loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { IExpense } from '@/utils/interface';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { fetchTruckExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import DriverName from '@/components/driver/DriverName';
import { useRouter } from 'next/navigation';

const TruckExpense: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<IExpense[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<IExpense | undefined>();

  const searchParams = useSearchParams();
  const monthYear = searchParams.get('monthYear')?.split(' ');
  const [month, year] = monthYear ? monthYear : [null, null];

  const router = useRouter()

  const getBook = async () => {
    try {
      setLoading(true);
      const truckExpenses = await fetchTruckExpense(month, year);
      setMaintainenceBook(truckExpenses);
    } catch (error) {
      setError((error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = async (expense: IExpense) => {
    try {
      const data = await handleAddCharge(expense, expense.id);
      router.refresh()// Close the modal after saving
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (month && year) getBook();
  }, [month, year]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Expense Type</th>
              <th>Payment Mode</th>
              <th>Notes</th>
              <th>Truck</th>
              <th>Driver</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook && maintainenceBook.map((fuel, index) => (
              <tr key={index} className="border-t hover:bg-slate-100">
                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                <td>{fuel.amount}</td>
                <td>{fuel.expenseType}</td>
                <td>{fuel.paymentMode}</td>
                <td>{fuel.notes}</td>
                <td>{fuel.truck}</td>
                <td>{fuel.driver ? <DriverName driverId={fuel.driver as string} /> : ''}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={'outline'}
                      onClick={() => {
                        setSelected(fuel);
                        setModalOpen(true);
                      }}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      variant={'destructive'}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleDelete(fuel._id as string);
                        setMaintainenceBook((prev) =>
                          prev.filter((item) => item._id !== fuel._id)
                        );
                        router.refresh()
                      }}
                    >
                      <MdDelete />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleEditExpense}
        driverId={selected?.driver || ''}
        selected={selected}
        truckPage={true}
      />
    </div>
  );
};

export default TruckExpense;
