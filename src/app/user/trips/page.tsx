'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { motion } from 'framer-motion';
import { MdDelete, MdEdit } from 'react-icons/md';
import { IoAddCircle, IoCloseCircleOutline, IoDuplicateOutline } from 'react-icons/io5';
import Link from 'next/link';

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
  const [openOptions, setOpenOptions] = useState(false);
  const dropdownRef = useRef<any>(null);
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setOpenOptionsId(null);
  //       setOpenOptions(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
    
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);


  const handleDelete = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to delete trip');
      router.push('/user/trips'); // Redirect to trips list after deletion
    } catch (error) {
      console.error('Error deleting trip:', error);
    }finally{
      mutate('/api/trips')
    }
  }

  const handleUndoStatus = async (trip : ITrip) => {
    const updateDates = (dates: (Date | null)[]): (Date | null)[] => {
      // Create a copy of the array to avoid mutating the original array
      const updatedDates = [...dates];

      for (let i = 1; i < updatedDates.length; i++) {
        if (updatedDates[i] === null) {
          updatedDates[i - 1] = null;
        }
      }

      return updatedDates;
    };
    if (trip.status == 0) {
      alert('Cannot Undo the Status')
      return
    }
    const data = {
      status: trip.status ? trip.status - 1 : alert('No Trip Status'),
      dates: updateDates(trip.dates)
    }
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        throw new Error('Failed to settle amount');
      }
      const resData = await res.json();
    } catch (error) {
      alert(error)
      console.log('Error settling amount:', error);
    }finally{
      mutate(`/api/trips`)
    }
  }

  const handleStatusUpdate = async (trip : ITrip) => {
    const data = {status : trip.status as number + 1}
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        throw new Error('Failed to settle amount');
      }
      const resData = await res.json();

    } catch (error) {
      alert(error)
      console.log('Error settling amount:', error);
    }finally{
      mutate(`/api/trips`)
    }

    if (data.status === 1) {
      try {
        const driverRes = await fetch(`/api/drivers/${trip.driver}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
        });
        if (!driverRes.ok) {
          throw new Error('Failed to update driver status');
        }
        const truckRes = await fetch(`/api/trucks/${trip.truck}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
        });
        if (!truckRes.ok) {
          throw new Error('Failed to update truck status');
        }
      } catch (error: any) {
        console.log(error);
        alert(error.message)
      }
    }

    if (data.status === 4) {
      router.push(`/user/trips/${trip.trip_id}`)
    }
  }


  const sortedTrips = useMemo(() => {
    if (!trips || trips.length === 0) return [];
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

  const debouncedSearch = useCallback(
    debounce((query) => setSearchQuery(query), 300),
    []
  );

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

      const totalBalance = data.trips.reduce((acc: number, trip: ITrip) => acc + trip.balance, 0);
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
    const status = value ? parseInt(value) : undefined;
    if (selectedStatus === status) {
      fetchTrips()
      return
    }
    fetchTrips(status);
    setSelectedStatus((prev) => prev === status ? undefined : status);
  };

  const handleDuplicate = useCallback((e: React.MouseEvent, trip: ITrip | any) => {
    e.stopPropagation();
    router.push(`/user/trips/create?trip=${encodeURIComponent(JSON.stringify(trip))}`);
    setOpenOptionsId(null);
  }, [router]);

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
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex items-center justify-between mt-4">
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
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes('Start Date') && (
                  <TableHead onClick={() => requestSort('startDate')}>
                    <div className="flex justify-center">
                      Start Date {getSortIcon('startDate')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.includes('LR Number') && (
                  <TableHead onClick={() => requestSort('LR')}>
                    <div className="flex justify-center">
                      LR Number {getSortIcon('LR')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.includes('Truck Number') && <TableHead>Truck Number</TableHead>}
                {visibleColumns.includes('Party Name') && <TableHead onClick={() => requestSort('partyName')}>
                  <div className='flex justify-center'>
                    Party Name {getSortIcon('partyName')}
                  </div>
                </TableHead>}
                {visibleColumns.includes('Route') && <TableHead>Route</TableHead>}
                {visibleColumns.includes('Status') && <TableHead onClick={() => requestSort('status')}>
                  <div className="flex justify-center">
                    Status {getSortIcon('status')}
                  </div>
                </TableHead>}
                {visibleColumns.includes('Truck Hire Cost') && (
                  <TableHead onClick={() => requestSort('truckHireCost')}>
                    <div className="flex justify-center">
                      Truck Hire Cost {getSortIcon('truckHireCost')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.includes('Invoice Amt') && (
                  <TableHead onClick={() => requestSort('amount')}>
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
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-orange-600" />
                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('LR Number') && <TableCell>{trip.LR}</TableCell>}
                  {visibleColumns.includes('Truck Number') && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FaTruck className="text-orange-600" />
                        <span>{trip.truck}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Party Name') && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{trip.partyName}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Route') && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}</span>
                      </div>
                    
                    </TableCell>
                  )}
                  {visibleColumns.includes('Status') && (
                    <TableCell>
                      <div className="flex flex-col items-center space-x-2">
                        <span>{statuses[trip.status as number]}</span>
                        <div className="relative w-full bg-gray-200 h-1 rounded">
                          <div
                            className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${
                              trip.status === 0 ? 'bg-red-500' :
                              trip.status === 1 ? 'bg-yellow-500' :
                              trip.status === 2 ? 'bg-blue-500' :
                              trip.status === 3 ? 'bg-green-500' :
                              'bg-green-800'
                            }`}
                            style={{ width: `${(trip.status as number) * 25}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Truck Hire Cost') && (
                    <TableCell>
                      <p className='text-red-500 font-semibold'>
                        {trip.truckHireCost ? '₹' + formatNumber(trip.truckHireCost) : 'NA'}
                      </p>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Invoice Amt') && (
                    <TableCell>
                      <p className='text-green-600 font-semibold'>₹{formatNumber(trip.amount)}</p>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <p className="text-green-600 font-semibold">₹{formatNumber(trip.balance)}</p>
                      <div className="relative" ref={dropdownRef}>
                        <Button
                          className="rounded-full"
                          variant={'ghost'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenOptionsId(openOptionsId === trip.trip_id ? null : trip.trip_id);
                          }}
                        >
                          <SlOptionsVertical size={20} />
                        </Button>
                        {openOptionsId === trip.trip_id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md flex flex-col gap-2 p-2 z-20"
                          >
                            <Button
                              variant={'ghost'}
                              onClick={(e) => handleDuplicate(e, trip)}
                              className="justify-start"
                            >
                              <IoDuplicateOutline className="mr-2" /> Duplicate
                            </Button>
                            <Button
                              variant={'ghost'}
                              onClick={(e) => { e.stopPropagation(); setOpenOptionsId(null); handleStatusUpdate(trip)}}
                              className="justify-start"
                            >
                              Update Status
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); setOpenOptionsId(null); handleUndoStatus(trip) }}
                              className="justify-start"
                            >
                              Undo Status
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={(e) => { e.stopPropagation(); setOpenOptionsId(null); handleDelete(trip.trip_id) }}
                              className="justify-start"
                            >
                              <MdDelete className="mr-2" /> Delete Trip
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenOptionsId(null);
                              }}
                              className="justify-start"
                            >
                              <IoCloseCircleOutline className="mr-2" /> Close
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TripsPage;