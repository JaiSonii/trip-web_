'use client';
import Loading from '@/app/user/loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { ITripCharges, IExpense } from '@/utils/interface';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MdDelete, MdEdit, MdLocalGasStation, MdPayment } from 'react-icons/md';
import { fetchTripExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import TripRoute from '@/components/trip/TripRoute';
import DriverName from '@/components/driver/DriverName';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { icons,IconKey } from '@/utils/icons';

const TripExpensePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<ITripCharges[] | IExpense[] | any>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<ITripCharges | IExpense | any>(null);

  const searchParams = useSearchParams();
  const monthYear = searchParams.get('monthYear')?.split(' ');
  const [month, year] = monthYear ? monthYear : [null, null];
  const router = useRouter();

  const getBook = async () => {
    try {
      setLoading(true);
      const tripExpense = await fetchTripExpense(month, year);
      setMaintainenceBook(tripExpense);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharge = async (chargeId: string) => {
    try {
      await handleDelete(chargeId);
      getBook();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditExpense = async (expense: IExpense) => {
    try {
      await handleAddCharge(expense, expense.id);
      setModalOpen(false);
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
      <h1 className="text-2xl font-bold mb-4 text-bottomNavBarColor">Trip Expenses</h1>
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
              <th className="border p-4 text-left">Trip</th>
              <th className="border p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook && maintainenceBook.map((fuel: any, index: number) => (
              <tr key={index} className="border-t hover:bg-indigo-100 cursor-pointer transition-colors">
                <td className="border p-4">{new Date(fuel.date).toLocaleDateString()}</td>
                <td className="border p-4">{fuel.amount}</td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    {icons[fuel.expenseType as IconKey]} {/* Default icon if not found */}
                    <span>{fuel.expenseType}</span>
                  </div>
                </td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <MdPayment className="text-green-500" />
                    <span>{fuel.paymentMode}</span>
                  </div>
                </td>
                <td className="border p-4">{fuel.notes || 'N/A'}</td>
                <td className="border p-4">{fuel.truck || 'N/A'}</td>
                <td className="border p-4">{fuel.driver ? <DriverName driverId={fuel.driver} /> : 'N/A'}</td>
                <td className="border p-4">{fuel.trip_id ? <TripRoute tripId={fuel.trip_id} /> : 'N/A'}</td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => { setSelected(fuel); setModalOpen(true); }}>
                      <MdEdit />
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteCharge(fuel._id)}>
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
        driverId={selected?.driver as string}
        selected={selected}
      />
    </div>
  );
};

export default TripExpensePage;
