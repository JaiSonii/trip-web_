'use client';
import Loading from '../loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { IExpense } from '@/utils/interface';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { MdDelete, MdEdit, MdPayment } from 'react-icons/md';
import { fetchTruckExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import DriverName from '@/components/driver/DriverName';
import { icons, IconKey } from '@/utils/icons';
import { FaCalendarAlt, FaTruck } from 'react-icons/fa';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IoAddCircle } from 'react-icons/io5';
import TruckExpenseModal from '@/components/TruckExpenseModal';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TruckExpense: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<IExpense[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<IExpense | null>(null);

  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    amount: true,
    expenseType: true,
    paymentMode: true,
    notes: true,
    truck: true,
    driver: true,
    action: true,
  });

  const searchParams = useSearchParams();
  const monthYear = searchParams.get('monthYear')?.split(' ');
  const [month, year] = monthYear ? monthYear : [null, null];



  const getBook = async () => {
    try {
      setLoading(true);
      const truckExpenses = await fetchTruckExpense(month, year);
      setMaintainenceBook(truckExpenses);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = async (expense: IExpense) => {
    try {
      selected ? await handleAddCharge(expense, expense.id) : handleAddCharge(expense, '', expense.truck);
      setModalOpen(false); // Close the modal after saving
      await getBook();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (month && year) getBook();
  }, [month, year]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const handleToggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleSelectAll = (selectAll: boolean) => {
    setVisibleColumns({
      date: selectAll,
      amount: selectAll,
      expenseType: selectAll,
      paymentMode: selectAll,
      notes: selectAll,
      truck: selectAll,
      driver: selectAll,
      action: selectAll,
    });
  };

  return (
    <div className="w-full h-full">

        <div className=" flex items-center justify-between w-full mb-1">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline">Select Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Object.values(visibleColumns).every(Boolean)}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span>Select All</span>
                </label>
              </DropdownMenuItem>
              {Object.keys(visibleColumns).map((column) => (
                <DropdownMenuItem key={column} asChild>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column as keyof typeof visibleColumns]}
                      onChange={() => handleToggleColumn(column as keyof typeof visibleColumns)}
                    />
                    <span>{column.charAt(0).toUpperCase() + column.slice(1)}</span>
                  </label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setModalOpen(true)}>
            Truck Expense     <IoAddCircle className='mt-1' />
          </Button>
        </div>


      <div className="">
        <Table className="">
          <TableHeader>
            <TableRow className="">
              {visibleColumns.date && <TableHead className="">Date</TableHead>}
              {visibleColumns.amount && <TableHead className="">Amount</TableHead>}
              {visibleColumns.expenseType && <TableHead className="">Expense Type</TableHead>}
              {visibleColumns.paymentMode && <TableHead className="">Payment Mode</TableHead>}
              {visibleColumns.notes && <TableHead className="">Notes</TableHead>}
              {visibleColumns.truck && <TableHead className="">Truck</TableHead>}
              {visibleColumns.driver && <TableHead className="">Driver</TableHead>}
              {visibleColumns.action && <TableHead className="">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintainenceBook.length > 0 ? (
              maintainenceBook.map((expense, index) => (
                <TableRow key={index} className="border-t hover:bg-indigo-100 cursor-pointer transition-colors">
                  {visibleColumns.date && (
                    <TableCell className="border p-4">
                      <div className='flex items-center space-x-2'>
                        <FaCalendarAlt className='text-bottomNavBarColor' />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.amount && <TableCell className="border p-4">₹{formatNumber(expense.amount)}</TableCell>}
                  {visibleColumns.expenseType && (
                    <TableCell className="border p-4">
                      <div className="flex items-center space-x-2">
                        {icons[expense.expenseType as IconKey]}
                        <span>{expense.expenseType}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.paymentMode && (
                    <TableCell className="border p-4">
                      <div className="flex items-center space-x-2">
                        <MdPayment className="text-green-500" />
                        <span>{expense.paymentMode}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.notes && <TableCell className="border p-4">{expense.notes || 'N/A'}</TableCell>}
                  {visibleColumns.truck && (
                    <TableCell className="border p-4">
                      <div className='flex items-center space-x-2'>
                        <FaTruck className='text-bottomNavBarColor' />
                        <span>{expense.truck || ''}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.driver && <TableCell className="border p-4">{expense.driver ? <DriverName driverId={expense.driver as string} /> : 'N/A'}</TableCell>}
                  {visibleColumns.action && (
                    <TableCell className="border p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={() => { setSelected(expense); setModalOpen(true); }} size="sm">
                          <MdEdit />
                        </Button>
                        <Button variant="destructive" onClick={async () => {
                          await handleDelete(expense._id as string);
                          setMaintainenceBook((prev) => prev.filter((item) => item._id !== expense._id));
                        }} size={"sm"}>
                          <MdDelete />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center p-4 text-gray-500">No expenses found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>


      <TruckExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleEditExpense}
        driverId={selected?.driver as string}
        selected={selected}
        truckPage={true}
      />

    </div>
  );
};

const TruckExpenseWrapper: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <TruckExpense />
    </Suspense>
  )

}

export default TruckExpenseWrapper;
