'use client';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IDriver, IExpense, TruckModel } from '@/utils/interface';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { MdDelete, MdEdit, MdPayment } from 'react-icons/md';
import { DeleteExpense, fetchTruckExpense, handleAddCharge, handleAddExpense, handleDelete } from '@/helpers/ExpenseOperation';
import { icons, IconKey } from '@/utils/icons';
import { FaCalendarAlt, FaSort, FaSortDown, FaSortUp, FaTruck } from 'react-icons/fa';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IoAddCircle } from 'react-icons/io5';
import { formatNumber, generateMonthYearOptions } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { TbFilterSearch } from 'react-icons/tb';
import dynamic from 'next/dynamic';

const TruckExpense: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [truckExpenseBook, setTruckExpenseBook] = useState<IExpense[] | any[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<IExpense | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const router = useRouter()

  const ExpenseFilterModal = dynamic(()=>import('@/components/ExpenseFilterModal'), {ssr : false})
  const AddExpenseModal = dynamic(()=> import('@/components/AddExpenseModal'), {ssr : false})

  const monthYearOptions = generateMonthYearOptions()

  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    amount: true,
    expenseType: true,
    notes: true,
    truck: true,
    action: true,
    ledger: true
  });


  const handleFilter = async (filter: { drivers: string[], trips: string[], trucks: string[], paymentModes: string[], monYear: string[], shops: string[], expenseTypes :[] }) => {
    try {
      const res = await fetch(`/api/expenses/truckExpense?filter=${encodeURIComponent(JSON.stringify(filter))}`)
      const data = await res.json()
      console.log(data)
      setTruckExpenseBook(data.truckExpense)
    } catch (error) {
      console.log(error)
    } finally {
      setFilterModalOpen(false)
    }
  }

  const sortedExpense = useMemo(() => {
    if (!truckExpenseBook || truckExpenseBook.length === 0) return [];  // This line ensures that truckExpenseBook is not null or empty
    let filteredexpenses = [...truckExpenseBook]

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      filteredexpenses = truckExpenseBook.filter((expense: any) =>
        expense.expenseType.toLowerCase().includes(lowercaseQuery) ||
        expense.paymentMode.toLowerCase().includes(lowercaseQuery) ||
        new Date(expense.date).toLocaleDateString().includes(lowercaseQuery) ||
        expense.amount.toString().includes(lowercaseQuery) ||
        expense.notes.toString().includes(lowercaseQuery) ||
        expense.driverName.toString().includes(lowercaseQuery) ||
        expense.truck.toLowerCase().includes(lowercaseQuery)
      )
    }
    if (sortConfig.key !== null) {
      filteredexpenses.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredexpenses;
  }, [truckExpenseBook, sortConfig, searchQuery]);


  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: any) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  }

  // Debounce the search input to reduce re-renders on each keystroke
  const debouncedSearch = useCallback(
    debounce((query) => setSearchQuery(query), 300),
    []
  );

  // Handle search input
  const handleSearch: any = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };


  const getBook = async (month: string | null, year: string | null) => {
    try {
      setLoading(true);
      console.log(month, year)
      const truckExpenses = await fetchTruckExpense(month, year);
      setTruckExpenseBook(truckExpenses);
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
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Call getBook with null for the first render
      getBook(null, null);
  }, [])

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
      notes: selectAll,
      truck: selectAll,
      action: selectAll,
      ledger : selectAll
    });
  };

  return (
    <div className="w-full h-full">

      <div className=" flex items-center justify-between w-full mb-1 gap-16">
        <div className='flex items-center space-x-2'>
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
          <input type='text' onChange={handleSearch} placeholder='Search...' />
        </div>

        <div className='flex items-center space-x-2'>
          <Button onClick={() => setModalOpen(true)}>
            Truck Expense     <IoAddCircle className='mt-1' />
          </Button>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setFilterModalOpen(true)}>
              <TbFilterSearch />
            </Button>

          </div>


        </div>

      </div>


      <div className="">
        <Table className="">
          <TableHeader>
            <TableRow className="">
              {visibleColumns.date && <TableHead onClick={() => requestSort('date')} className="">
                <div className='flex justify-between'>
                  Date {getSortIcon('date')}
                </div>
              </TableHead>}
              {visibleColumns.amount && <TableHead onClick={() => requestSort('amount')} className="">
                <div className='flex justify-between'>
                  Amount {getSortIcon('amount')}
                </div>
              </TableHead>}
              {visibleColumns.expenseType && <TableHead onClick={() => requestSort('expenseType')} className="">
                <div className='flex justify-between'>
                  Expense Type {getSortIcon('expenseType')}
                </div>
              </TableHead>}
              {visibleColumns.ledger && <TableHead className="">
                <div className='flex justify-between'>
                  Payment Mode
                </div>
              </TableHead>}
              {visibleColumns.notes && <TableHead onClick={() => requestSort('notes')} className="">
                <div className='flex justify-between'>
                  Notes {getSortIcon('notes')}
                </div>
              </TableHead>}
              {visibleColumns.truck && <TableHead className="">
                <div className='flex justify-between'>
                  Lorry
                </div>
              </TableHead>}
              {visibleColumns.action && <TableHead className="">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpense.length > 0 ? (
              sortedExpense.map((expense, index) => (
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
                  {visibleColumns.ledger && (
                    <TableCell className="border p-4">
                      <div className="flex items-center justify-between">
                        <p>{expense.paymentMode}</p><p className='whitespace-nowrap'> {expense.driverName || expense.shopName}</p>
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
                  {visibleColumns.action && (
                    <TableCell className="border p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={() => { setSelected(expense); setModalOpen(true); }} size="sm">
                          <MdEdit />
                        </Button>
                        <Button variant="destructive" onClick={async () => {
                          await DeleteExpense(expense._id as string);
                          setTruckExpenseBook((prev) => prev.filter((item) => item._id !== expense._id));
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


      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selected ? handleEditExpense : handleAddExpense}
        driverId={selected?.driver as string}
        selected={selected} categories={['Truck Expense', 'Trip Expense', 'Office Expense']}      />
      <ExpenseFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        paymentModes={['Paid By Driver', 'Cash', 'Online', 'Credit']}
        monthYearOptions={monthYearOptions}
        handleFilter={handleFilter} />

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
