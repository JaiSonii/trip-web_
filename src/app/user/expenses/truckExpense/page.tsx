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

  const router = useRouter();

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
      selected ? await handleAddCharge(expense, expense.id) : handleAddCharge(expense, '',expense.truck);
      setModalOpen(false); // Close the modal after saving
      getBook();
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
    <div className="w-full h-full p-4">

      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold mb-4 text-bottomNavBarColor">Truck Expenses</h1>

        <div className="mb-4 flex items-center gap-2">
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
          <Button onClick={()=>setModalOpen(true)}>
          Truck Expense     <IoAddCircle className='mt-1'/>
        </Button>
        </div>
       
      </div>


      <div className="table-container overflow-auto bg-white shadow rounded-lg">
        <table className="custom-table w-full border-collapse table-auto">
          <thead>
            <tr className="bg-indigo-600 text-white">
              {visibleColumns.date && <th className="border p-4 text-left">Date</th>}
              {visibleColumns.amount && <th className="border p-4 text-left">Amount</th>}
              {visibleColumns.expenseType && <th className="border p-4 text-left">Expense Type</th>}
              {visibleColumns.paymentMode && <th className="border p-4 text-left">Payment Mode</th>}
              {visibleColumns.notes && <th className="border p-4 text-left">Notes</th>}
              {visibleColumns.truck && <th className="border p-4 text-left">Truck</th>}
              {visibleColumns.driver && <th className="border p-4 text-left">Driver</th>}
              {visibleColumns.action && <th className="border p-4 text-left">Action</th>}
            </tr>
          </thead>
          <tbody>
            {maintainenceBook.length > 0 ? (
              maintainenceBook.map((expense, index) => (
                <tr key={index} className="border-t hover:bg-indigo-100 cursor-pointer transition-colors">
                  {visibleColumns.date && (
                    <td className="border p-4">
                      <div className='flex items-center space-x-2'>
                        <FaCalendarAlt className='text-bottomNavBarColor' />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.amount && <td className="border p-4">{expense.amount}</td>}
                  {visibleColumns.expenseType && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        {icons[expense.expenseType as IconKey]}
                        <span>{expense.expenseType}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.paymentMode && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <MdPayment className="text-green-500" />
                        <span>{expense.paymentMode}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.notes && <td className="border p-4">{expense.notes || 'N/A'}</td>}
                  {visibleColumns.truck && (
                    <td className="border p-4">
                      <div className='flex items-center space-x-2'>
                        <FaTruck className='text-bottomNavBarColor' />
                        <span>{expense.truck || ''}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.driver && <td className="border p-4">{expense.driver ? <DriverName driverId={expense.driver as string} /> : 'N/A'}</td>}
                  {visibleColumns.action && (
                    <td className="border p-4">
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
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-500">No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
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
