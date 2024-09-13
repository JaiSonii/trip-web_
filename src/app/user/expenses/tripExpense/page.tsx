'use client';
import Loading from '../loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { ITripCharges, IExpense } from '@/utils/interface';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { MdDelete, MdEdit, MdLocalGasStation, MdPayment } from 'react-icons/md';
import { fetchTripExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import TripRoute from '@/components/trip/TripRoute';
import DriverName from '@/components/driver/DriverName';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { icons, IconKey } from '@/utils/icons';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import TripExpenseModal from '@/components/TripExpenseModal';
import { IoAddCircle } from 'react-icons/io5';

const TripExpensePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<ITripCharges[] | IExpense[] | any>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<ITripCharges | IExpense | any>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'Date', 'Amount', 'Expense Type', 'Payment Mode', 'Notes', 'Truck', 'Driver', 'Trip', 'Action'
  ]);

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

  const handleEditExpense = async (expense: IExpense | any) => {
    try {
      selected ? await handleAddCharge(expense, expense.id) : await fetch(`/api/trips/${expense.trip}/truckExpense`, {
        method : 'POST',
        body : JSON.stringify(expense)
      }).then((res)=>res.ok ? null : alert('Failed to add Expense'));
      setModalOpen(false);
      getBook();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (month && year) getBook();
  }, [month, year]);

  useEffect(() => {
    const storedColumns = localStorage.getItem('visibleColumns');
    if (storedColumns) {
      setVisibleColumns(JSON.parse(storedColumns));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);


  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;



  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };



  return (
      <div className="w-full h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-bottomNavBarColor">Trip Expenses</h1>
          <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline">Select Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['Date', 'Amount', 'Expense Type', 'Payment Mode', 'Notes', 'Truck', 'Driver', 'Trip', 'Action'].map((column) => (
                <DropdownMenuItem key={column} asChild>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(column)}
                      onChange={() => toggleColumn(column)}
                    />
                    <span>{column}</span>
                  </label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={()=>setModalOpen(true)}>
            Trip Expense <IoAddCircle className='mt-1'/>
          </Button>
          </div>
         
        </div>

        <div className="table-container overflow-auto bg-white shadow rounded-lg">
          <table className="custom-table w-full border-collapse table-auto">
            <thead>
              <tr className="bg-indigo-600 text-white">
                {visibleColumns.includes('Date') && <th className="border p-4 text-left">Date</th>}
                {visibleColumns.includes('Amount') && <th className="border p-4 text-left">Amount</th>}
                {visibleColumns.includes('Expense Type') && <th className="border p-4 text-left">Expense Type</th>}
                {visibleColumns.includes('Payment Mode') && <th className="border p-4 text-left">Payment Mode</th>}
                {visibleColumns.includes('Notes') && <th className="border p-4 text-left">Notes</th>}
                {visibleColumns.includes('Truck') && <th className="border p-4 text-left">Truck</th>}
                {visibleColumns.includes('Driver') && <th className="border p-4 text-left">Driver</th>}
                {visibleColumns.includes('Trip') && <th className="border p-4 text-left">Trip</th>}
                {visibleColumns.includes('Action') && <th className="border p-4 text-left">Action</th>}
              </tr>
            </thead>
            <tbody>
              {maintainenceBook.map((fuel: any, index: number) => (
                <tr key={index} className="border-t hover:bg-indigo-100 cursor-pointer transition-colors">
                  {visibleColumns.includes('Date') && <td className="border p-4">{new Date(fuel.date).toLocaleDateString()}</td>}
                  {visibleColumns.includes('Amount') && <td className="border p-4">{fuel.amount}</td>}
                  {visibleColumns.includes('Expense Type') && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        {icons[fuel.expenseType as IconKey]}
                        <span>{fuel.expenseType}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('Payment Mode') && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <MdPayment className="text-green-500" />
                        <span>{fuel.paymentMode}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('Notes') && <td className="border p-4">{fuel.notes || 'N/A'}</td>}
                  {visibleColumns.includes('Truck') && <td className="border p-4">{fuel.truck || 'N/A'}</td>}
                  {visibleColumns.includes('Driver') && (
                    <td className="border p-4">{fuel.driver ? <DriverName driverId={fuel.driver} /> : 'N/A'}</td>
                  )}
                  {visibleColumns.includes('Trip') && (
                    <td className="border p-4">{fuel.trip_id ? <TripRoute tripId={fuel.trip_id} /> : 'N/A'}</td>
                  )}
                  {visibleColumns.includes('Action') && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        {fuel.partyBill != false && <Button variant="outline" onClick={() => { setSelected(fuel); setModalOpen(true); }}>
                          <MdEdit />
                        </Button>}
                        
                        <Button variant="destructive" onClick={() => handleDeleteCharge(fuel._id)}>
                          <MdDelete />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TripExpenseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleEditExpense}
          driverId={selected?.driver as string}
          selected={selected}
        />
      </div>
  );
};

const TripExpensePageWrapper: React.FC = ()=>{
  return(
    <Suspense fallback={<Loading />}>
      <TripExpensePage />
    </Suspense>
  )
}

export default TripExpensePageWrapper;
