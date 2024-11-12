'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';
import { FaTruck, FaCalendarAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { SlOptionsVertical } from 'react-icons/sl';
import { MdClose, MdDelete, MdEdit } from 'react-icons/md';
import { IoDuplicateOutline } from 'react-icons/io5';
import { IoMdUndo } from 'react-icons/io';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
import { useSWRConfig } from 'swr';
import dynamic from 'next/dynamic';

const EditTripForm = dynamic(() => import('@/components/trip/EditTripForm'), {
  ssr: false,
  loading: () => <div className='flex items-center justify-center'><Loader2 className='animate-spin text-bottomNavBarColor' /></div>
});

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
  const { mutate } = useSWRConfig();
  const [edit, setEdit] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null);

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

  const handleStatusChange = useCallback((value: string) => {
    const status = value ? parseInt(value) : undefined;
    setSelectedStatus(prevStatus => prevStatus === status ? undefined : status);
    fetchTrips(status);
  }, [fetchTrips]);

  const handleDelete = useCallback(async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete trip');
      mutate('/api/trips');
      router.push('/user/trips');
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  }, [mutate, router]);

  const handleUndoStatus = useCallback(async (trip: ITrip) => {
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
  }, [mutate]);

  const handleDuplicate = useCallback((e: React.MouseEvent, trip: ITrip) => {
    e.stopPropagation();
    router.push(`/user/trips/create?trip=${encodeURIComponent(JSON.stringify(trip))}`);
    setOpenOptionsId(null);
  }, [router]);

  const debouncedSearch = useMemo(() => debounce((query: string) => setSearchQuery(query), 300), []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value.toLowerCase());
  }, [debouncedSearch]);

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

  const requestSort = useCallback((key: keyof ITrip) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const getSortIcon = useCallback((columnName: keyof ITrip) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  }, [sortConfig]);

  const handleCancelEdit = useCallback(() => {
    setEdit(false);
    setSelectedTrip(null);
  }, []);

  const handleEdit = useCallback(async (data: Partial<ITrip>) => {
    if (!selectedTrip) return;
    setLoading(true)
    try {
      const res = await fetch(`/api/trips/${selectedTrip.trip_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });

      if (!res.ok) throw new Error('Failed to edit trip');

      const newData = await res.json();
      if (newData.status === 400) {
        alert(newData.message);
        return;
      }

      await Promise.all([
        fetch(`/api/drivers/${selectedTrip.driver}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Available' }),
        }),
        fetch(`/api/trucks/${selectedTrip.truck}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Available' }),
        })
      ]);

      mutate('/api/trips');
    } catch (error) {
      console.error('Error editing trip:', error);
    } finally {
      setSelectedTrip(null);
      setEdit(false);
      setLoading(false);
    }
  }, [selectedTrip, mutate]);

  if (loading) return <Loading />;
  if (error) return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;

  return (
    <div className="w-full p-4 h-full bg-white">
      <div className='flex w-full px-4 md:px-60'>
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between mt-4">
        <div className="flex items-center bg-orange-100 rounded-sm text-orange-800 p-2 mb-2 md:mb-0">
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
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStatus === index}
                      onChange={() => handleStatusChange(index.toString())}
                    />
                    <span>{status}</span>
                  </label>
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
          <AnimatePresence>
            {edit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-3xl max-h-[90vh] overflow-y-auto thin-scrollbar"
                >
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                  >
                    <MdClose size={24} />
                  </Button>
                  <EditTripForm
                    trip={selectedTrip as ITrip}
                    onSubmit={handleEdit}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <Table>
            <TableHeader>
              <TableRow>
                {columnOptions.map(col =>
                  visibleColumns.includes(col.label) && (
                    <TableHead key={col.value} onClick={() => requestSort(col.value as keyof ITrip)}>
                      <div className="flex justify-center items-center">
                        {col.label} {col.value !== 'route' && getSortIcon(col.value as keyof ITrip)}
                      </div>
                    </TableHead>
                  )
                )}
                <TableHead onClick={() => requestSort('balance')}>
                  <div className="flex justify-center items-center">
                    Party Balance {getSortIcon('balance')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrips.map((trip: ITrip) => (
                <TableRow
                  key={trip.trip_id}
                  className="hover:bg-orange-50 cursor-pointer transition-colors duration-200"
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
                          <DropdownMenuItem onClick={(e) => handleDuplicate(e, trip)} className='cursor-pointer hover:bg-orange-100 transition-colors duration-200'>
                            <IoDuplicateOutline className="mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUndoStatus(trip); }} className='cursor-pointer hover:bg-orange-100 transition-colors duration-200'>
                            <IoMdUndo className="mr-2" />Undo Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEdit(true); setSelectedTrip(trip) }} className='cursor-pointer hover:bg-orange-100 transition-colors duration-200'>
                            <MdEdit className="mr-2" /> Edit Trip
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(trip.trip_id); }} className='cursor-pointer hover:bg-orange-100 transition-colors duration-200'>
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
        <div>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-orange-600" />
            <span>{new Date(trip.startDate).toLocaleDateString('en-IN')}</span>
          </div>
          <div>
            <span className='font-medium text-xs text-gray-500 whitespace-nowrap'>
              Validity :
              {(() => {
                const eWayBillDoc = trip.documents?.find(doc => doc.type === 'E-Way Bill');
                return eWayBillDoc?.validityDate
                  ? new Date(eWayBillDoc.validityDate as any).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                  : 'N/A';
              })()}
            </span>

          </div>
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
        <div className="flex flex-col items-center space-y-1">
          <span>{statuses[trip.status as number]}</span>
          <div className="relative w-full bg-gray-200 h-2 rounded">
            <div
              className={`absolute top-0 left-0 h-2 rounded transition-all duration-500 ${trip.status === 0 ? 'bg-red-500' :
                trip.status === 1 ? 'bg-yellow-500' :
                  trip.status === 2 ? 'bg-blue-500' :
                    trip.status === 3 ? 'bg-green-500' :
                      'bg-green-800'
                }`}
              style={{ width: `${(trip.status as number + 1) * 20}%` }}
            />
          </div>
        </div>
      );
    case 'amount':
      return <p className='text-green-600 font-semibold'>₹{formatNumber(trip.amount)}</p>;
    case 'truckHireCost':
      return (
        <p className='text-red-500 font-semibold'>
          {trip.truckHireCost ? '₹' + formatNumber(trip.truckHireCost) : 'NA'}
        </p>
      );
    default:
      return null;
  }
}