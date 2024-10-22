'use client';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IDriver, IExpense, ITrip, TruckModel } from '@/utils/interface';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { DeleteExpense, handleEditExpense, handleAddExpense, } from '@/helpers/ExpenseOperation';

import {  FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { generateMonthYearOptions } from '@/utils/utilArray';
import debounce from 'lodash.debounce';
import { TbFilterSearch } from 'react-icons/tb';
import dynamic from 'next/dynamic';
import ExpenseTable from '@/components/ExpenseTable';

const TripExpense: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [truckExpenseBook, setTruckExpenseBook] = useState<IExpense[] | any[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<IExpense | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const AddExpenseModal = dynamic(()=> import('@/components/AddExpenseModal'), {ssr : false})
  const ExpenseFilterModal = dynamic(() => import('@/components/ExpenseFilterModal'), {ssr : false})


  const monthYearOptions = generateMonthYearOptions()

  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    amount: true,
    expenseType: true,
    notes: true,
    truck: true,
    ledger : true,
    action: true,
    trip: true
  });


  const handleFilter = async (filter: { drivers: string[], trips: string[], trucks: string[], paymentModes: string[], monYear: string[], shops: string[], expenseTypes : string[] }) => {
    console.log(filter)
    try {
      const res = await fetch(`/api/expenses/tripExpense?filter=${encodeURIComponent(JSON.stringify(filter))}`)
      const data = await res.json()
      console.log(data)
      setTruckExpenseBook(data.tripExpense)
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
        expense.expenseType?.toLowerCase().includes(lowercaseQuery) ||
        expense.paymentMode?.toLowerCase().includes(lowercaseQuery) ||
        new Date(expense.date)?.toLocaleDateString().includes(lowercaseQuery) ||
        expense.amount?.toString().includes(lowercaseQuery) ||
        expense.notes?.toString().includes(lowercaseQuery) ||
        expense.driverName?.toString().includes(lowercaseQuery) ||
        expense.truck?.toLowerCase().includes(lowercaseQuery)
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


  const getBook = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses')
      if(!res.ok){
        alert("error fetching expenses")
      }
      const data = await res.json();
      setTruckExpenseBook(data.expenses);
    } catch (error) {
      alert('Internal Server Error')
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async(id : string)=>{
    try{
      const expense = await DeleteExpense(id)
      setTruckExpenseBook(truckExpenseBook.filter((item) => item._id!== expense._id));
    }catch(error){
      alert('Failed to delete expense')
      console.log(error)
    }
  }

  const handleExpense = async (expense: IExpense | any, id? : string, file? : File | null) => {
    console.log(file)
    try {
      const data = selected ? await handleEditExpense(expense,selected._id as string, file) : await handleAddExpense(expense, file)
      selected ?
        setTruckExpenseBook((prev) => (
          prev.map((exp) => exp._id === data._id ? ({ ...exp, ...data }) : exp)
        )) : setTruckExpenseBook((prev)=>[
          {...data},
          ...prev
        ])

    } catch (error) {
      console.error(error);
      alert('Please try again')
    } finally {
      setSelected(null)
      setModalOpen(false);
    }
  };

  useEffect(() => {
    // Call getBook with null for the first render
    getBook();
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
      trip: selectAll,
      ledger: selectAll,
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
          <Button onClick={() => {
            setSelected(null)
            setModalOpen(true)
          }}>
            Add Expense
          </Button>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setFilterModalOpen(true)}>
              <TbFilterSearch />
            </Button>
          </div>
        </div>
      </div>

      <div className="">
        <ExpenseTable 
        sortedExpense={sortedExpense}
        handleDelete={handleDelete}
        visibleColumns={visibleColumns}
        requestSort={requestSort}
        getSortIcon={getSortIcon}
        setSelected={setSelected}
        setTruckExpenseBook={setTruckExpenseBook}
        setModalOpen={setModalOpen}
        />
      </div>


      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleExpense}
        driverId={selected?.driver as string}
        selected={selected}
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']}
      />
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
      <TripExpense />
    </Suspense>
  )

}

export default TruckExpenseWrapper;
