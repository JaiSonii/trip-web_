'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {  IDriver, IExpense, ITrip, TruckModel } from '@/utils/interface';
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
import { DeleteExpense, handleAddExpense, handleEditExpense } from '@/helpers/ExpenseOperation';

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
  const [trucks, setTrucks] = useState<TruckModel[]>([])
  const [trips, setTrips] = useState<ITrip[]>([])
  const [shops, setShops] = useState<any[]>([])
  const [drivers, setDrivers] = useState<IDriver[]>([])

  const AddExpenseModal = dynamic(()=>import('@/components/AddExpenseModal'), {ssr : false})

  const handleExpense = async(editedExpense : IExpense)=>{
    try {
      if(selected){
        const expense: any = await handleEditExpense(editedExpense, selected._id as string)
        setData((prev)=>(
          prev.map((item)=>item._id === expense._id? expense : item)
        ))
      }else{
        const expense : any= handleAddExpense(editedExpense)
        setData((prev) => [
          expense, // new expense added at the beginning
          ...prev, // spread in the previous expenses
        ]);
        
      }
    } catch (error) {
      alert('Failed to perform expense operation')
      console.log(error)
    }
  }

  const handleDeleteExpense = async(id : string)=>{
    try {
      const expense = await DeleteExpense(id)
      if(expense){
        setData((prev) => prev.filter((item)=>item._id!== expense._id))
      }
    } catch (error) {
      alert('Failed to Delete Expense')
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [truckRes, profitRes] = await Promise.all([
          fetch(`/api/trucks/${truckNo}`),
          fetch(`/api/trucks/${truckNo}/summary`)
        ]);

        const [truckData, profitData] = await Promise.all([
          truckRes.ok? truckRes.json() : [],
          profitRes.ok? profitRes.json() : []
        ])

        console.log(truckData)
        setData(truckData.truck.truckLedger);

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
    const fetchTruckDetails = async () => {
      try {
          const [ truckres, tripres,shopres, driverres] = await Promise.all([fetch('/api/trucks'),fetch('/api/trips'), fetch('/api/shopkhata'), fetch('/api/drivers/create')]);
          
          const [truckData,tripData,shopData,driverData] =  await Promise.all([
              truckres.ok ? truckres.json() : [],
              tripres.ok ? tripres.json() : [],
              shopres.ok ? shopres.json() : [],
              driverres.ok ? driverres.json() : []
          ])
          setTrips(tripData.trips);
          setShops(shopData.shops);
          setDrivers(driverData.drivers);
          setTrucks(truckData.trucks)
      } catch (error: any) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };
  fetchTruckDetails();
  }, [truckNo]);


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
                <TableCell><span className='text-green-500 font-semibold'>₹{!item.expenseType ? formatNumber(item.tripRevenue) : ''}</span></TableCell>
                <TableCell>
                  {item.expenseType ?
                    <div className='flex space-x-2 justify-center items-center w-full p-1'>
                      <Button variant="outline" onClick={() => {
                        setSelected(item);
                        setModelOpen(true);
                      }}><MdEdit /></Button>
                      <Button onClick={() => handleDeleteExpense(item._id)} variant={'destructive'} ><MdDelete /></Button>
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
      <AddExpenseModal
        isOpen={modelOpen}
        onClose={() => setModelOpen(false)}
        onSave={handleExpense}
        trips={trips}
        trucks={trucks}
        drivers={drivers}
        shops={shops}
        truckNo={truckNo as string}
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']} driverId={''}
        selected={selected}/>
    </div>
  );
};

export default TruckPage;
