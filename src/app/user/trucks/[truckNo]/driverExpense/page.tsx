'use client';
import Loading from '@/app/loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { ITruckExpense } from '@/utils/interface';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { MdDelete } from 'react-icons/md';
import { maintenanceChargeTypes } from '@/utils/utilArray';
import { handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import { fetchDriverName } from '@/helpers/driverOperations';
import TripRoute from '@/components/trip/TripRoute';

const OtherExpense = () => {
  const { truckNo } = useParams();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<ITruckExpense[]>([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<ITruckExpense | undefined>();

  const getBook = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trucks/${truckNo}/expense`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await res.json();
      const filteredData = data.filter((expense: ITruckExpense) => !maintenanceChargeTypes.has(expense.expenseType));
      setMaintainenceBook(filteredData);
    } catch (error) {
      setError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [truckNo]);

  useEffect(() => {
    getBook();
  }, [getBook]);

  const handleDeleteExpense = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await handleDelete(id, e);
      setMaintainenceBook((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleAddExpense = useCallback(async (newCharge: any, id?: string) => {
    try {
      const data = await handleAddCharge(newCharge, id, truckNo as string);

      setMaintainenceBook((prev) => {
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
            {maintainenceBook.map((fuel, index) => (
              <tr
                key={index}
                className="border-t hover:bg-slate-100"
                onClick={() => {
                  setSelected(fuel);
                  setModelOpen(true);
                }}
              >
                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                <td>{fuel.amount}</td>
                <td>{fuel.expenseType}</td>
                <td>{fuel.paymentMode}</td>
                <td>{fuel.notes}</td>
                <td>{fetchDriverName(fuel.driver as string) || 'NA'}</td>
                <td><TripRoute tripId={fuel.trip || ''} /></td>
                <td>
                  <Button onClick={(e) => handleDeleteExpense(fuel._id as string, e)} variant={'destructive'}>
                    <MdDelete />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseModal
        isOpen={modelOpen}
        onClose={() => setModelOpen(false)}
        onSave={handleAddExpense}
        driverId=''
        selected={selected}
        truckPage={true}
      />
    </div>
  );
};

export default OtherExpense;
