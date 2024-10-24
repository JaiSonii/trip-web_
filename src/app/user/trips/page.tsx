'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { FaTruck, FaCalendarAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatNumber } from '@/utils/utilArray';
import { SlOptionsVertical } from 'react-icons/sl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import debounce from 'lodash.debounce';
import { useExpenseCtx } from '@/context/context';
import { mutate } from 'swr';


const columnOptions = [
  { label: 'Start Date', value: 'startDate' },
  { label: 'LR Number', value: 'LR' },
  { label: 'Truck Number', value: 'truck' },
  { label: 'Party Name', value: 'party' },
  { label: 'Route', value: 'route' },
  { label: 'Status', value: 'status' },
  { label: 'Invoice Amt', value: 'invoice' },
  { label: 'Truck Hire Cost', value: 'truckCost' }
];

const TripsPage = () => {
  mutate('/api/trips')
  const ctxTrips = useExpenseCtx().trips
  const router = useRouter();
  const [trips, setTrips] = useState<ITrip[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columnOptions.map(col => col.value));
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions.map(col => col.label));
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')

  const sortedTrips = useMemo(() => {
    if (!trips || trips.length === 0) return [];  // This line ensures that trips is not null or empty
    let filteredTrips = [...trips]

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      filteredTrips = trips.filter((trip) =>
        trip.LR.toLowerCase().includes(lowercaseQuery) ||
        trip.partyName.toLowerCase().includes(lowercaseQuery) ||
        trip.route.origin.toLowerCase().includes(lowercaseQuery) ||
        trip.route.destination.toLowerCase().includes(lowercaseQuery) ||
        new Date(trip.startDate).toLocaleDateString().includes(lowercaseQuery) ||
        trip.amount.toString().includes(lowercaseQuery) ||
        trip.truckHireCost.toString().includes(lowercaseQuery) ||
        trip.balance.toString().includes(lowercaseQuery) ||
        trip.truck.toLowerCase().includes(lowercaseQuery)
      )
    }
    if (sortConfig.key !== null) {
      filteredTrips.sort((a, b) => {
        if (a[sortConfig.key as keyof ITrip] < b[sortConfig.key as keyof ITrip]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof ITrip] > b[sortConfig.key as keyof ITrip]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredTrips;
  }, [trips, sortConfig, searchQuery]);


  const requestSort = (key: keyof ITrip) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: keyof ITrip) => {
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
    debouncedSearch(e.target.value.toLowerCase());
  };

  const toggleColumn = useCallback((column: string) => {
    setVisibleColumns(prev => {
      const isVisible = prev.includes(column);
      return isVisible ? prev.filter(col => col !== column) : [...prev, column];
    });
  }, []);




  const fetchTrips = useCallback(async (status?: number) => {
    setLoading(true);
    setError(null);

    try {
      const queryParam = status !== undefined ? `?status=${status}` : '';
      const res = await fetch(`/api/trips${queryParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await res.json();
      setTrips(data.trips);

      // Calculate total balance
      const totalBalance = data.trips.reduce((acc: number, trip: ITrip) => acc + trip.balance, 0);

      // Set the total balance
      setTotalBalance(totalBalance);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ctxTrips.length > 0) {
      setTrips(ctxTrips)
      setTotalBalance(ctxTrips.reduce((acc: number, trip: ITrip) => acc + trip.balance, 0));
    } else fetchTrips();
  }, []);


  const handleStatusChange = (value: string) => {
    const status = value ? parseInt(value) : undefined;  // If value is empty, status becomes undefined
    if (selectedStatus === status) {
      fetchTrips()
      return
    }
    fetchTrips(status);  // Fetch based on status or all trips if undefined
    setSelectedStatus((prev) => prev === status ? undefined : status);
  };

  if (loading) return <Loading />;



  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 h-full bg-white">
      <div className='flex w-full px-60'>
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center bg-lightOrange rounded-sm text-buttonTextColor p-2">
          <span>Total Balance :</span>
          {totalBalance !== null ? (
            <span className="ml-2 text-lg font-bold">{totalBalance}</span>
          ) : (
            <span className="ml-2 text-lg font-bold animate-pulse">Calculating...</span>
          )}
        </div>
        <div className='flex items-end space-x-2 p-2'>
          <div className="flex items-center space-x-4">
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status, index) => (
                  <SelectItem key={index} value={index.toString()} >
                    <input
                      type="checkbox"
                      checked={selectedStatus === index}
                      onChange={() => handleStatusChange(index.toString())}
                    />
                    <span className='text-black'>{status}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline">Select Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {columnOptions.map((col) => (
                  <DropdownMenuItem key={col.value} asChild>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.label)}
                        onChange={() => toggleColumn(col.label)}
                      />
                      <span>{col.label}</span>
                    </label>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>




      {(!trips || trips.length === 0) ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">No trips found</div>
        </div>
      ) : (
        <div className="w-full">
          <div className="">
            <Table className="">
              <TableHeader className="">
                <TableRow>
                  {visibleColumns.includes('Start Date') && (
                    <TableHead className="" onClick={() => requestSort('startDate')}>
                      <div className="flex justify-center">
                        Start Date {getSortIcon('startDate')}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('LR Number') && (
                    <TableHead className="border p-4 text-left cursor-pointer" onClick={() => requestSort('LR')}>
                      <div className="flex justify-center">
                        LR Number {getSortIcon('LR')}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('Truck Number') && <TableHead className="">Truck Number</TableHead>}
                  {visibleColumns.includes('Party Name') && <TableHead className="" onClick={() => requestSort('partyName')}>
                    <div className='flex justify-center'>
                      Party Name {getSortIcon('partyName')}
                    </div>
                  </TableHead>}
                  {visibleColumns.includes('Route') && <TableHead className="">Route</TableHead>}
                  {visibleColumns.includes('Status') && <TableHead className="" onClick={() => requestSort('status')}>
                    <div className="flex justify-center">
                      Status {getSortIcon('status')}
                    </div>
                  </TableHead>}
                  {visibleColumns.includes('Truck Hire Cost') && (
                    <TableHead className="" onClick={() => requestSort('truckHireCost')}>
                      <div className="flex justify-center">
                        Truck Hire Cost {getSortIcon('truckHireCost')}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('Invoice Amt') && (
                    <TableHead className="" onClick={() => requestSort('amount')}>
                      <div className="flex justify-center">
                        Invoice Amount {getSortIcon('amount')}
                      </div>
                    </TableHead>
                  )}
                  <TableHead onClick={() => requestSort('balance')}>
                    <div className="flex justify-center">
                      Party Balance {getSortIcon('balance')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrips.map((trip: ITrip, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-orange-100 cursor-pointer"
                    onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
                  >
                    {visibleColumns.includes('Start Date') && (
                      <TableCell className="">
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="text-orange-600" />
                          <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.includes('LR Number') && <TableCell className="">{trip.LR}</TableCell>}
                    {visibleColumns.includes('Truck Number') && (
                      <TableCell className="">
                        <div className="flex items-center space-x-2">
                          <FaTruck className="text-orange-600" />
                          <span>{trip.truck}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.includes('Party Name') && (
                      <TableCell className="">
                        <div className="flex items-center space-x-2">
                          <span>{trip.partyName}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.includes('Route') && (
                      <TableCell className="">
                        <div className="flex items-center space-x-2">
                          <span>{trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.includes('Status') && (
                      <TableCell className="">
                        <div className="flex flex-col items-center space-x-2">
                          <span>{statuses[trip.status as number]}</span>
                          <div className="relative w-full bg-gray-200 h-1 rounded">
                            <div
                              className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0
                                ? 'bg-red-500'
                                : trip.status === 1
                                  ? 'bg-yellow-500'
                                  : trip.status === 2
                                    ? 'bg-blue-500'
                                    : trip.status === 3
                                      ? 'bg-green-500'
                                      : 'bg-green-800'
                                }`}
                              style={{ width: `${(trip.status as number) * 25}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.includes('Truck Hire Cost') && (
                      <TableCell className="">
                        <p className='text-red-500 font-semibold'>
                          {trip.truckHireCost ? '₹' + formatNumber(trip.truckHireCost) : 'NA'}
                        </p>
                      </TableCell>
                    )}
                    {visibleColumns.includes('Invoice Amt') && (
                      <TableCell className="">
                        <p className='text-green-600 font-semibold'>₹{formatNumber(trip.amount)}</p>
                      </TableCell>
                    )}
                    <TableCell className="">
                      <div className='flex items-center justify-between'>
                        <p className='text-green-600 font-semibold'>₹{formatNumber(trip.balance)}</p>
                        <SlOptionsVertical />
                      </div>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
