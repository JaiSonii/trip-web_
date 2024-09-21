'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {  IExpense } from '@/utils/interface';
import { useParams, useRouter } from 'next/navigation';
import { statuses } from '@/utils/schema';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { MdDelete, MdEdit } from 'react-icons/md';
import Link from 'next/link';
import { FaCalendarAlt, FaRoute } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Loading = dynamic(() => import('./loading'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
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

  const ExpenseModal = dynamic(() => import('@/components/trip/tripDetail/ExpenseModal'), {
    ssr: false,
    loading: () => <Loading />,
  });


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

        // const tripDataWithPartyNames = await Promise.all(
        //   tripData.trips.map(async (trip: any) => {
        //     const partyName = await fetchPartyName(trip.party);
        //     return { ...trip, partyName };
        //   })
        // );

        const combinedData = [...expenseData, ...tripData.trips].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        console.log(combinedData)
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
        <h2 className="text-lg font-bold text-green-700">Total Revenue: <span className="text-black">₹{formatNumber(revenue)}</span></h2>
        <h2 className="text-lg font-bold text-red-700">Total Expense: <span className="text-black">₹{formatNumber(totalExpense)}</span></h2>
        <h2 className="text-lg font-bold text-blue-700">Profit: <span className="text-black">₹{formatNumber(revenue - totalExpense)}</span></h2>
      </div>

      <div className="table-container">
        <Table className="custom-table">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Expense</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaCalendarAlt className='text-bottomNavBarColor' />
                    <span>{new Date(item.date || item.startDate).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.expenseType ? (
                    <div className="flex items-center space-x-2 p-2">
                      <span className="font-semibold text-lg text-gray-800">{item.expenseType}</span>
                      {item.trip_id && (
                        <Button variant={"link"} className="text-red-500 pt-1 rounded-lg">
                          <Link href={`/user/trips/${item.trip_id}`}>from a trip</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-2 bg-white rounded-lg">
                      <div className="flex flex-col justify-center space-y-1 border-r border-gray-300 pr-4">
                        <div className="flex items-center space-x-2">
                          <FaRoute className="text-bottomNavBarColor text-base" />
                          <span className="font-semibold text-sm text-gray-800">
                            {item.route?.origin.split(',')[0]} &rarr; {item.route?.destination.split(',')[0]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GoOrganization className="text-bottomNavBarColor text-base" />
                          <span className="text-xs text-gray-600">{item.partyName}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-start flex-grow pl-4">
                        <span className="font-semibold text-sm text-gray-600">
                          {statuses[item.status as number]}
                        </span>
                        <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mt-1">
                          <div
                            className={`h-full transition-width duration-500 rounded ${item.status === 0
                              ? "bg-red-500"
                              : item.status === 1
                                ? "bg-yellow-500"
                                : item.status === 2
                                  ? "bg-blue-500"
                                  : item.status === 3
                                    ? "bg-green-500"
                                    : "bg-green-800"
                              }`}
                            style={{ width: `${(item.status + 1) * 20}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>


                  )}
                </TableCell>

                <TableCell>
                  <span className='text-red-500 font-semibold'>₹{item.expenseType ? formatNumber(item.amount) : 0}</span>
                </TableCell>
                <TableCell><span className='text-green-500 font-semibold'>₹{!item.expenseType ? formatNumber(item.revenue) : ''}</span></TableCell>
                <TableCell>
                  {item.expenseType ?
                    <div className='flex space-x-2 justify-center items-center w-full p-1'>
                      <Button variant="outline" onClick={() => {
                        setSelected(item);
                        setModelOpen(true);
                      }}><MdEdit /></Button>
                      <Button onClick={() => handleDelete(item._id)} variant={'destructive'} ><MdDelete /></Button>
                    </div> :
                    <div className='flex items-center justify-center'>
                      <Link href={`/user/trips/${item.trip_id}`}><Button variant={'outline'} >View Trip</Button></Link>
                    </div>

                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
