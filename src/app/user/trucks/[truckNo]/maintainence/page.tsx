'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loading from '../loading';
import { IExpense } from '@/utils/interface';
import { fetchDriverName } from '@/helpers/driverOperations';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import TripRoute from '@/components/trip/TripRoute';
import { Button } from '@/components/ui/button';
import { MdDelete, MdEdit, MdLocalGasStation, MdPayment } from 'react-icons/md';
import DriverName from '@/components/driver/DriverName';
import { FaCalendarAlt } from 'react-icons/fa';

const TruckMaintainenceBook = () => {
  const { truckNo } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<IExpense[]>([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/trucks/${truckNo}/expense?type=maintenance`);
        if (!res.ok) {
          throw new Error('Failed to fetch maintenance book');
        }
        const data = await res.json();
        setMaintainenceBook(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, [truckNo]);

  const handleDelete = async (id: string, e: React.FormEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/truckExpense/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to delete expense');
      }
      setMaintainenceBook(maintainenceBook.filter((item) => item._id !== id));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAddCharge = async (newCharge: any, id?: string) => {
    const truckExpenseData = {
      ...newCharge,
      truck: truckNo,
      transaction_id: newCharge.transactionId || '',
      driver: newCharge.driver || '',
      notes: newCharge.notes || '',
    };

    try {
      const res = await fetch(`/api/truckExpense/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckExpenseData),
      });
      if (!res.ok) {
        throw new Error('Failed to add charge');
      }
      const data = await res.json();
      setMaintainenceBook((prev: IExpense[]) => {
        const index = prev.findIndex(item => item._id === data.charge._id);
        if (index !== -1) {
          prev[index] = data.charge;
        }
        return [...prev];
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      {error && <div className="text-red-500">{error}</div>}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Expense Type</th>
              <th>Payment Mode</th>
              <th>Notes</th>
              <th>Driver</th>
              <th>Trip</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook.map((expense, index) => (
              <tr
                key={index}
                className="border-t hover:bg-slate-100"
              >
                <td>
                  <div className='flex items-center space-x-2'>
                    <FaCalendarAlt className='text-bottomNavBarColor' />
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </td>

                <td className="border p-4">{expense.amount}</td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <MdLocalGasStation className="text-blue-500" />
                    <span>{expense.expenseType}</span>
                  </div>
                </td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <MdPayment className="text-green-500" />
                    <span>{expense.paymentMode}</span>
                  </div>
                </td>
                <td className="border p-4">{expense.notes || ''}</td>
                <td className="border p-4">{expense.driver ? <DriverName driverId={expense.driver} /> : 'N/A'}</td>
                <td className="border p-4">{expense.trip_id ? <TripRoute tripId={expense.trip_id} /> : 'N/A'}</td>
                <td>
                  <div className='flex items-center space-x-2'>
                    <Button variant="outline" onClick={() => { setSelected(expense); setModelOpen(true); }}>
                      <MdEdit />
                    </Button>
                    <Button variant="destructive" onClick={(e) => handleDelete(expense._id as string, e)}>
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
        isOpen={modelOpen}
        onClose={() => setModelOpen(false)}
        onSave={handleAddCharge}
        driverId={selected?.driver || ''}
        selected={selected}
        truckPage={true}
      />
    </div>
  );
};

export default React.memo(TruckMaintainenceBook);
