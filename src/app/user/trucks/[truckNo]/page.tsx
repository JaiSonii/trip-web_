'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { ITrip, IExpense } from '@/utils/interface';
import { useParams, useRouter } from 'next/navigation';
import { statuses } from '@/utils/schema';
import { fetchPartyName } from '@/helpers/fetchPartyName';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { MdDelete, MdEdit } from 'react-icons/md';
import Link from 'next/link';

const Loading = dynamic(() => import('../[truckNo]/loading'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const ExpenseModal = dynamic(() => import('@/components/trip/tripDetail/ExpenseModal'), {
  ssr: false,
  loading: () => <Loading />,
});

const TripRevenue = dynamic(() => import('@/components/trip/tripDetail/Profit/TripRevenue'), {
  ssr: false,
  loading: () => <Loading />,
});

const TruckPage = () => {
  const { truckNo } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expenseRes, tripRes, profitRes] = await Promise.all([
          fetch(`/api/trucks/${truckNo}/expense`),
          fetch(`/api/trips/truck/${truckNo}`),
          fetch(`/api/trucks/${truckNo}/summary`)
        ]);

        const [expenseData, tripData, profitData] = await Promise.all([
          expenseRes.ok ? expenseRes.json() : [],
          tripRes.ok ? tripRes.json() : [],
          profitRes.ok ? profitRes.json() : []
        ]);

        const tripDataWithPartyNames = await Promise.all(
          tripData.trips.map(async (trip: any) => {
            const partyName = await fetchPartyName(trip.party);
            return { ...trip, partyName };
          })
        );

        const combinedData = [...expenseData, ...tripDataWithPartyNames].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setData(combinedData);

        setTotalExpense(profitData.truckExpense);
        setRevenue(profitData.tripRevenue);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [truckNo]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/truckExpense/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      setData(prevData => prevData.filter((item) => item._id !== id));
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      alert(error.message);
    }
  }, [router]);

  const handleAddCharge = useCallback(async (newCharge: any, id?: string) => {
    try {
      const truckExpenseData = {
        ...newCharge,
        truck: truckNo,
        transaction_id: newCharge.transactionId || '',
        driver: newCharge.driver || '',
        notes: newCharge.notes || '',
      };

      const res = await fetch(`/api/truckExpense/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckExpenseData),
      });
      if (!res.ok) throw new Error('Failed to add charge');

      const data = await res.json();
      setData(prev => {
        const index = prev.findIndex(item => item._id === data.charge._id);
        prev[index] = data.charge;
        return [...prev];
      });
      router.refresh();
    } catch (error: any) {
      console.error('Error adding charge:', error);
      alert(error.message);
    }
  }, [truckNo, router]);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-green-700">Total Revenue: <span className="text-black">{revenue}</span></h2>
        <h2 className="text-lg font-bold text-red-700">Total Expense: <span className="text-black">{totalExpense}</span></h2>
        <h2 className="text-lg font-bold text-blue-700">Profit: <span className="text-black">{revenue - totalExpense}</span></h2>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Expense</th>
              <th>Revenue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.date || item.dates?.[0]).toLocaleDateString()}</td>
                <td>
                  {item.expenseType ||
                    `${statuses[item.status]} ● ${item.partyName} ● ${item.route?.origin.split(',')[0]} -> ${item.route?.destination.split(',')[0]}`}
                </td>
                <td>{item.expenseType ? item.amount : ''}</td>
                <td>{!item.expenseType ? <TripRevenue tripId={item.trip_id} amount={item.amount}/> : ''}</td>
                <td>
                  {item.expenseType ?
                    <div className='flex flex-row justify-evenly items-center w-full p-1'>
                      <Button variant="outline" onClick={() => {
                        setSelected(item);
                        setModelOpen(true);
                      }}><MdEdit /></Button>
                      <Button onClick={() => handleDelete(item._id)} variant={'destructive'} ><MdDelete /></Button>
                    </div> :
                    <Link href={`/user/trips/${item.trip_id}`}><Button variant={'outline'} >View Trip</Button></Link>
                  }
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

export default TruckPage;
