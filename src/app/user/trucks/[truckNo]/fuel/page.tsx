'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaCalendarAlt } from 'react-icons/fa';
import { MdDelete, MdEdit, MdPayment } from 'react-icons/md';
import DriverName from '@/components/driver/DriverName';
import TripRoute from '@/components/trip/TripRoute';
import { Button } from '@/components/ui/button';
import Loading from '../loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { IExpense } from '@/utils/interface';
import { formatNumber } from '@/utils/utilArray';

interface TripDetails {
  [key: string]: string;
}

const TruckFuelBook: React.FC = () => {
  const { truckNo } = useParams();
  const [fuelBook, setFuelBook] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState<TripDetails>({});
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense | undefined>(undefined);

  const fetchFuel = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trucks/${truckNo}/expense?type=fuel`);
      if (!res.ok) throw new Error('Failed to fetch fuel book');
      const data = await res.json();
      setFuelBook(data);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [truckNo]);

  useEffect(() => {
    fetchFuel();
  }, [fetchFuel]);

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/truckfuel/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to delete fuel');
      setFuelBook(prevFuelBook => prevFuelBook.filter(item => item._id !== id));
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  }, []);

  const handleAddCharge = useCallback(async (newCharge: any, id?: string) => {
    const truckfuelData = {
      ...newCharge,
      truck: truckNo,
      transaction_id: newCharge.transactionId || '',
      driver: newCharge.driver || '',
      notes: newCharge.notes || '',
    };

    try {
      const res = await fetch(`/api/truckfuel/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckfuelData),
      });
      if (!res.ok) throw new Error('Failed to add charge');
      const data = await res.json();
      setFuelBook(prev => {
        const index = prev.findIndex(item => item._id === data.charge._id);
        if (index !== -1) {
          prev[index] = data.charge;
          return [...prev];
        }
        return prev;
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message);
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
              <th>Payment Mode</th>
              <th>Notes</th>
              <th>Driver</th>
              <th>Trip</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fuelBook?.map((fuel, index) => (
              <tr key={index} className="border-t hover:bg-slate-100">
                <td>
                  <div className='flex items-center space-x-2'>
                    <FaCalendarAlt className='text-bottomNavBarColor' />
                    <span>{new Date(fuel.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="border p-4">₹{formatNumber(fuel.amount)}</td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <MdPayment className="text-green-500" />
                    <span>{fuel.paymentMode}</span>
                  </div>
                </td>
                <td className="border p-4">{fuel.notes || ''}</td>
                <td className="border p-4">{fuel.driver ? <DriverName driverId={fuel.driver} /> : 'N/A'}</td>
                <td className="border p-4">{fuel.trip_id ? <TripRoute tripId={fuel.trip_id} /> : 'N/A'}</td>
                <td>
                  <div className='flex items-center space-x-2'>
                    <Button variant="outline" onClick={() => { setSelected(fuel); setModelOpen(true); }}>
                      <MdEdit />
                    </Button>
                    <Button variant="destructive" onClick={(e) => handleDelete(fuel._id as string, e)}>
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

export default React.memo(TruckFuelBook);
