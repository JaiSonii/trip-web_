'use client';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IDriver, IExpense, ITrip, TruckModel } from '@/utils/interface';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { DeleteExpense, handleAddCharge, handleAddExpense, } from '@/helpers/ExpenseOperation';

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
  const [trucks, setTrucks] = useState<TruckModel[]>([])
  const [drivers, setDrivers] = useState<IDriver[]>([])
  const [shops, setShops] = useState<any[]>([])
  const [trips, setTrips] = useState<ITrip[]>([])

  const AddExpenseModal = dynamic(()=> import('@/components/AddExpenseModal'), {ssr : false})
  const ExpenseFilterModal = dynamic(() => import('@/components/ExpenseFilterModal'), {ssr : false})

  const fetchData = async () => {
    try {
      const [truckres, driverres, shopres, tripRes] = await Promise.all([fetch(`/api/trucks/create`), fetch('/api/drivers/create'), fetch('/api/shopkhata'), fetch(`/api/trips`)])
      const [truckData, driverData, shopData, tripData] = await Promise.all([truckres.json(), driverres.json(), shopres.json(), tripRes.json()])
      setTrucks(truckData.trucks)
      setDrivers(driverData.drivers)
      setShops(shopData.shops)
      setTrips(tripData.trips)
    } catch (error) {
      alert('Some Error Occured')
    }

  }

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

  const handleEditExpense = async (expense: IExpense | any) => {
    try {
      const data = selected ? await handleAddCharge(expense, expense.id) : await fetch(`/api/expenses`, {
        method: 'POST',
        body: JSON.stringify(expense)
      }).then((res) => res.ok ? res.json() : alert('Failed to add Expense'));
      selected ?
        setTruckExpenseBook((prev) => (
          prev.map((exp) => exp._id === data.charge._id ? ({ ...exp, ...data.charge }) : exp)
        )) : getBook()

    } catch (error) {
      console.error(error);
      alert('Please try again')
    } finally {
      setModalOpen(false);
    }
  };

  useEffect(() => {
    // Call getBook with null for the first render
    getBook();
  }, [])

  useEffect(() => {
    fetchData()
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
          <Button onClick={() => setModalOpen(true)}>
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
        handleDelete={DeleteExpense}
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
        onSave={selected ? handleEditExpense : handleAddExpense}
        driverId={selected?.driver as string}
        selected={selected}
        trucks={trucks}
        drivers={drivers}
        trips={trips}
        shops={shops} 
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']}
      />
      <ExpenseFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        paymentModes={['Paid By Driver', 'Cash', 'Online', 'Credit']}
        monthYearOptions={monthYearOptions}
        handleFilter={handleFilter}
        trucks={trucks}
        drivers={drivers}
        shops={shops}
        trips={trips} />

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
