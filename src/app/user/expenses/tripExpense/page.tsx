'use client';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { ITripCharges, IExpense } from '@/utils/interface';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { MdDelete, MdEdit, MdPayment } from 'react-icons/md';
import { fetchTripExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import TripRoute from '@/components/trip/TripRoute';
import DriverName from '@/components/driver/DriverName';
import { useRouter } from 'next/navigation';
import { icons, IconKey } from '@/utils/icons';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { IoAddCircle } from 'react-icons/io5';
import { formatNumber } from '@/utils/utilArray';
import dynamic from 'next/dynamic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TripExpensePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<ITripCharges[] | IExpense[] | any>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<ITripCharges | IExpense | any>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'Date', 'Amount', 'Expense Type', 'Payment Mode', 'Notes', 'Truck', 'Driver', 'Trip', 'Action'
  ]);

  const TripExpenseModal = dynamic(()=>import('@/components/TripExpenseModal'), {ssr : false})

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
        <div className="flex ">
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

        <div className="">
          <Table >
            <TableHeader>
              <TableRow >
                {visibleColumns.includes('Date') && <TableHead className="">Date</TableHead>}
                {visibleColumns.includes('Amount') && <TableHead className="">Amount</TableHead>}
                {visibleColumns.includes('Expense Type') && <TableHead className="">Expense Type</TableHead>}
                {visibleColumns.includes('Payment Mode') && <TableHead className="">Payment Mode</TableHead>}
                {visibleColumns.includes('Notes') && <TableHead className="">Notes</TableHead>}
                {visibleColumns.includes('Truck') && <TableHead className="">Truck</TableHead>}
                {visibleColumns.includes('Driver') && <TableHead className="">Driver</TableHead>}
                {visibleColumns.includes('Trip') && <TableHead className="">Trip</TableHead>}
                {visibleColumns.includes('Action') && <TableHead className="">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintainenceBook.map((fuel: any, index: number) => (
                <TableRow key={index}>
                  {visibleColumns.includes('Date') && <TableCell className="">{new Date(fuel.date).toLocaleDateString()}</TableCell>}
                  {visibleColumns.includes('Amount') && <TableCell className="">₹{formatNumber(fuel.amount)}</TableCell>}
                  {visibleColumns.includes('Expense Type') && (
                    <TableCell className="">
                      <div className="flex items-center space-x-2">
                        {icons[fuel.expenseType as IconKey]}
                        <span>{fuel.expenseType}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Payment Mode') && (
                    <TableCell className="">
                      <div className="flex items-center space-x-2">
                        <MdPayment className="text-green-500" />
                        <span>{fuel.paymentMode}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Notes') && <TableCell className="">{fuel.notes || 'N/A'}</TableCell>}
                  {visibleColumns.includes('Truck') && <TableCell className="">{fuel.truck || 'N/A'}</TableCell>}
                  {visibleColumns.includes('Driver') && (
                    <TableCell className="">{fuel.driver ? <DriverName driverId={fuel.driver} /> : 'N/A'}</TableCell>
                  )}
                  {visibleColumns.includes('Trip') && (
                    <TableCell className="">{fuel.trip_id ? <TripRoute tripId={fuel.trip_id} /> : 'N/A'}</TableCell>
                  )}
                  {visibleColumns.includes('Action') && (
                    <TableCell className="">
                      <div className="flex items-center space-x-2">
                        {fuel.partyBill != false && <Button variant="outline" onClick={() => { setSelected(fuel); setModalOpen(true); }}>
                          <MdEdit />
                        </Button>}
                        
                        <Button variant="destructive" onClick={() => handleDeleteCharge(fuel._id)}>
                          <MdDelete />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
