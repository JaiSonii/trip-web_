'use client';
import React, { useEffect, useState } from 'react';
import { ITrip, ITruckExpense } from '@/utils/interface';
import { useParams } from 'next/navigation';
import { statuses } from '@/utils/schema';
import { fetchPartyName } from '@/helpers/fetchPartyName';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import Loading from '@/app/loading';
import { Button } from '@/components/ui/button';
import { MdDelete, MdEdit } from 'react-icons/md';
import Link from 'next/link';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { useRouter } from 'next/navigation';

const TruckPage = () => {
  const [data, setData] = useState<any[]>([]);
  const { truckNo } = useParams();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<ITruckExpense>();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expenseRes, tripRes] = await Promise.all([
          fetch(`/api/trucks/${truckNo}/expense`),
          fetch(`/api/trips`),
        ]);

        const [expenseData, tripData] = await Promise.all([
          expenseRes.ok ? expenseRes.json() : [],
          tripRes.ok ? tripRes.json() : [],
        ]);

        const filteredTripData = tripData.trips.filter((trip: ITrip) => trip.truck === truckNo);

        const tripDataWithPartyNames = await Promise.all(
          filteredTripData.map(async (trip: any) => {
            const partyName = await fetchPartyName(trip.party);
            return { ...trip, partyName };
          })
        );

        const combinedData = [...expenseData, ...tripDataWithPartyNames].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setData(combinedData);

        let totalExpense = 0;
        let totalRevenue = 0;

        combinedData.forEach((item) => {
          if (item.expenseType) {
            totalExpense += item.amount;
          } else {
            totalRevenue += item.amount;
          }
        });

        setTotalExpense(totalExpense);
        setRevenue(totalRevenue);
      } catch (error: any) {
        console.log(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [truckNo]);

  if (loading) return <Loading />;

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/truckExpense/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      alert('Failed to delete expense');
      return;
    }
    setData(data.filter((item) => item._id !== id));
    const deletedItem = data.find((item) => item._id === id);
    if (deletedItem) {
      setTotalExpense(totalExpense - deletedItem.amount);
      setRevenue(revenue + deletedItem.amount);
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

    const res = await fetch(`/api/truckExpense/${id}`,{
      method : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truckExpenseData),
    })
    if (!res.ok) {
      alert('Failed to add charge');
      return;
    }
    const data = await res.json()
    setData((prev : ITruckExpense[])=> {
     const index =  prev.findIndex(item=> item._id == data.charge._id)
     prev[index] = data.charge
     return prev
    })
    setTotalExpense(totalExpense - (selected?.amount as number) + newCharge.amount)
  };

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
                <td>{!item.expenseType ? fetchBalance(item) : ''}</td>
                <td>
                  {item.expenseType ?
                    <div className='flex flex-row justify-evenly items-center w-full p-1'>
                      <Button onClick={() => {
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
        driverId=''
        selected={selected}
        truckPage={true}
      />
    </div>
  );
};

export default TruckPage;
