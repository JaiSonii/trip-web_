'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IExpense } from '@/utils/interface';
import { useParams } from 'next/navigation';
import { MdDelete, MdEdit, MdLocalGasStation, MdPayment } from 'react-icons/md';
import { handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import { fetchDriverName } from '@/helpers/driverOperations';
import TripRoute from '@/components/trip/TripRoute';
import DriverName from '@/components/driver/DriverName';
import { FaCalendarAlt } from 'react-icons/fa';
import { IconKey, icons } from '@/utils/icons';
import { formatNumber } from '@/utils/utilArray';

// Dynamically import ExpenseModal to split the code
const ExpenseModal = dynamic(() => import('@/components/trip/tripDetail/ExpenseModal'), {
  loading: () => <Loading />,
});

const OtherExpense = () => {
  const { truckNo } = useParams();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [otherExpenses, setOtherExpenses] = useState<IExpense[]>([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense | undefined>();

  const fetchOther = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trucks/${truckNo}/expense?type=other`);
      if (!res.ok) {
        throw new Error('Failed to fetch other expenses');
      }
      const data = await res.json();
      setOtherExpenses(data);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOther();
  }, [truckNo]);

  const handleDeleteExpense = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await handleDelete(id, e);
      setOtherExpenses((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleAddExpense = useCallback(async (newCharge: any, id?: string) => {
    try {
      const data = await handleAddCharge(newCharge, id, truckNo as string);
      setOtherExpenses((prev) => {
        if (id) {
          return prev.map((item) => (item._id === id ? data.charge : item));
        } else {
          return [...prev, data.charge];
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, [truckNo]);

  const renderedExpenses = useMemo(() => (
    otherExpenses.map((expense, index) => (
      <tr
        key={index}
        className="border-t hover:bg-slate-100"
      >
        <td className="border p-4">
          <div className='flex items-center space-x-2'>
            <FaCalendarAlt className='text-bottomNavBarColor'/>
            <span>{new Date(expense.date).toLocaleDateString()}</span>
          </div>
          </td>
        <td className="border p-4">₹{formatNumber(expense.amount)}</td>
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
    ))
  ), [otherExpenses, handleDeleteExpense]);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Expense Type</th>
              <th>PaymentMode</th>
              <th>Notes</th>
              <th>Driver</th>
              <th>Trip</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {renderedExpenses}
          </tbody>
        </table>
      </div>
      {modelOpen && (
        <ExpenseModal
          isOpen={modelOpen}
          onClose={() => setModelOpen(false)}
          onSave={handleAddExpense}
          driverId=''
          selected={selected}
          truckPage={true}
        />
      )}
    </div>
  );
};

export default React.memo(OtherExpense);
