'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import debounce from 'lodash.debounce';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaTruck, FaCalendarAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { SlOptionsVertical } from 'react-icons/sl';
import { MdDelete, MdEdit } from 'react-icons/md';
import { IoAddCircle, IoCloseCircleOutline, IoDuplicateOutline } from 'react-icons/io5';

import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { formatNumber } from '@/utils/utilArray';
import { useExpenseCtx } from '@/context/context';
import Loading from './loading';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IoMdUndo } from 'react-icons/io';


const columnOptions = [
  { label: 'Start Date', value: 'startDate' },
  { label: 'LR Number', value: 'LR' },
  { label: 'Truck Number', value: 'truck' },
  { label: 'Party Name', value: 'party' },
  { label: 'Route', value: 'route' },
  { label: 'Status', value: 'status' },
  { label: 'Invoice Amt', value: 'amount' },
  { label: 'Truck Hire Cost', value: 'truckHireCost' }
];

export default function TripsPage() {
  const { trips: ctxTrips } = useExpenseCtx();
  const router = useRouter();
  const [trips, setTrips] = useState<ITrip[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions.map(col => col.label));
  const [sortConfig, setSortConfig] = useState<{ key: keyof ITrip | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);

  const fetchTrips = useCallback(async (status?: number) => {
    setLoading(true);
    setError(null);
    try {
      const queryParam = status !== undefined ? `?status=${status}` : '';
      const res = await fetch(`/api/trips${queryParam}`);
      if (!res.ok) throw new Error('Failed to fetch trips');
      const data = await res.json();
      setTrips(data.trips);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ctxTrips.length > 0) {
      setTrips(ctxTrips);
    } else {
      fetchTrips();
    }
  }, [ctxTrips, fetchTrips]);

  const handleStatusChange = (value: string) => {
    const status = value ? parseInt(value) : undefined;
    setSelectedStatus(prevStatus => prevStatus === status ? undefined : status);
    fetchTrips(status);
  };

  const handleDelete = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete trip');
      mutate('/api/trips');
      router.push('/user/trips');
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleUndoStatus = async (trip: ITrip) => {
    if (trip.status === 0) {
      alert('Cannot Undo the Status');
      return;
    }
    const data = {
      status: trip.status as number - 1,
      dates: trip.dates.map((date, index, array) => index === array.length - 1 ? null : date)
    };
    try {
      
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      mutate('/api/trips');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDuplicate = useCallback((e: React.MouseEvent, trip: ITrip) => {
    e.stopPropagation();
    router.push(`/user/trips/create?trip=${encodeURIComponent(JSON.stringify(trip))}`);
    setOpenOptionsId(null);
  }, [router]);

  const debouncedSearch = useMemo(() => debounce((query: string) => setSearchQuery(query), 300), []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value.toLowerCase());
  };

  const toggleColumn = useCallback((column: string) => {
    setVisibleColumns(prev => prev.includes(column) ? prev.filter(col => col !== column) : [...prev, column]);
  }, []);

  const sortedTrips = useMemo(() => {
    if (!trips) return [];
    let filteredTrips = [...trips];

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filteredTrips = filteredTrips.filter((trip) =>
        Object.values(trip).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
        )
      );
    }

    if (sortConfig.key) {
      filteredTrips.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key!] > b[sortConfig.key!]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredTrips;
  }, [trips, sortConfig, searchQuery]);

  const requestSort = (key: keyof ITrip) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (columnName: keyof ITrip) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  if (loading) return <Loading />;
  if (error) return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;

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
          <span>Total Balance:</span>
          <span className="ml-2 text-lg font-bold">
            {trips ? formatNumber(trips.reduce((acc, trip) => acc + trip.balance, 0)) : 'Calculating...'}
          </span>
        </div>
        <div className='flex items-end space-x-2 p-2'>
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status, index) => (
                <SelectItem key={index} value={index.toString()}>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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

      {(!trips || trips.length === 0) ? (
        <div className="flex justify-center items-center h-full text-gray-500">No trips found</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columnOptions.map(col => 
                  visibleColumns.includes(col.label) && (
                    <TableHead key={col.value} onClick={() => requestSort(col.value as keyof ITrip)}>
                      <div className="flex justify-center">
                        {col.label} {getSortIcon(col.value as keyof ITrip)}
                      </div>
                    </TableHead>
                  )
                )}
                <TableHead onClick={() => requestSort('balance')}>
                  <div className="flex justify-center">
                    Party Balance {getSortIcon('balance')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrips.map((trip: ITrip) => (
                <TableRow
                  key={trip.trip_id}
                  className="hover:bg-orange-100 cursor-pointer"
                  onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
                >
                  {columnOptions.map(col => 
                    visibleColumns.includes(col.label) && (
                      <TableCell key={col.value}>
                        {renderCellContent(col.value, trip)}
                      </TableCell>
                    )
                  )}
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <p className="text-green-600 font-semibold">₹{formatNumber(trip.balance)}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="rounded-full"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenOptionsId(openOptionsId === trip.trip_id ? null : trip.trip_id);
                            }}
                          >
                            <SlOptionsVertical size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={(e : any) => handleDuplicate(e, trip)} className='cursor-pointer hover:scale-105 transition-all duration-150 ease-in-out'>
                            <IoDuplicateOutline className="mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem  onClick={(e) => { e.stopPropagation(); handleUndoStatus(trip); }} className='cursor-pointer hover:scale-105 transition-all duration-150 ease-in-out'>
                            <IoMdUndo className="mr-2" />Undo Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(trip.trip_id); }} className='cursor-pointer hover:scale-105 transition-all duration-150 ease-in-out'>
                            <MdDelete className="mr-2" /> Delete Trip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
}

function renderCellContent(columnValue: string, trip: ITrip) {
  switch (columnValue) {
    case 'startDate':
      return (
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-orange-600" />
          <span>{new Date(trip.startDate).toLocaleDateString()}</span>
        </div>
      );
    case 'LR':
      return trip.LR;
    case 'truck':
      return (
        <div className="flex items-center space-x-2">
          <FaTruck className="text-orange-600" />
          <span>{trip.truck}</span>
        </div>
      );
    case 'party':
      return trip.partyName;
    case 'route':
      return `${trip.route.origin.split(',')[0]} → ${trip.route.destination.split(',')[0]}`;
    case 'status':
      return (
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
              style={{ width: `${trip.status as number * 25}%` }}
            />
          </div>
        </div>
      );
    case 'invoice':
      return <p className='text-green-600 font-semibold'>₹{formatNumber(trip.amount)}</p>;
    case  'truckCost':
      return (
        <p className='text-red-500 font-semibold'>
          {trip.truckHireCost ? '₹' + formatNumber(trip.truckHireCost) : 'NA'}
        </p>
      );
    default:
      return null;
  }
}