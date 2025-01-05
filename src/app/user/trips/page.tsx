'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';
import { FaTruck, FaCalendarAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { SlOptionsVertical } from 'react-icons/sl';
import { MdDelete, MdEdit } from 'react-icons/md';
import { IoDuplicateOutline } from 'react-icons/io5';
import { IoMdUndo } from 'react-icons/io';
import { Loader2 } from 'lucide-react';

import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { formatNumber } from '@/utils/utilArray';
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
import dynamic from 'next/dynamic';
import { useToast } from '@/components/hooks/use-toast';
import { ewbColor } from '@/utils/EwayBillColor';
import {
  useGetTripsQuery,
  useDeleteTripMutation,
  useUpdateTripStatusMutation,
  useEditTripMutation,
} from '@/store/api';
import { useExpenseData } from '@/components/hooks/useExpenseData';
import InvoiceForm from '@/components/trip/tripDetail/TripFunctions/InvoiceForm';
import Link from 'next/link';

const EditTripForm = dynamic(() => import('@/components/trip/EditTripForm'), {
  ssr: false,
  loading: () => <div className='modal-class'><div className='flex items-center justify-center'><Loader2 className='animate-spin text-bottomNavBarColor' /></div></div>
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
  const router = useRouter();
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions.map(col => col.label));
  const [sortConfig, setSortConfig] = useState<{ key: keyof ITrip | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const { toast } = useToast();

  const { data: trips, isLoading, error } = useGetTripsQuery(selectedStatus);
  const [deleteTrip] = useDeleteTripMutation();
  const [updateTripStatus] = useUpdateTripStatusMutation();
  const [editTrip] = useEditTripMutation();
  const { refetchTrips } = useExpenseData()

  useEffect(() => {
    refetchTrips()
  }, [refetchTrips])

  useEffect(() => {
    const storedColumns = localStorage.getItem('visibleColumns');
    console.log(storedColumns)
    if (!storedColumns || storedColumns.length === 0){
      setVisibleColumns(columnOptions.map(col => col.label));
    }
    if (storedColumns) {
      setVisibleColumns(JSON.parse(storedColumns));
    }
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value === 'all' ? undefined : parseInt(value));
  }, []);

  const handleDelete = useCallback(async (tripId: string) => {
    try {
      await deleteTrip(tripId).unwrap();
      toast({
        description: "Trip deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        description: "Error deleting trip",
        variant: 'destructive'
      });
    }
  }, [deleteTrip, toast]);

  const handleUndoStatus = useCallback(async (trip: ITrip) => {
    if (trip.status === 0) {
      alert('Cannot Undo the Status');
      return;
    }
    const newStatus = trip.status as number - 1;
    const newDates = trip.dates.map((date, index, array) => index === array.length - 1 ? null : date);
    try {
      await updateTripStatus({ tripId: trip.trip_id, status: newStatus, dates: newDates as (string | null)[] }).unwrap();
      toast({
        description: "Status updated successfully",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        description: "Error updating status",
        variant: 'destructive'
      });
    }
  }, [updateTripStatus, toast]);

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
    setVisibleColumns(prev => {
      const updatedColumns = prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column];

      // Save to localStorage
      localStorage.setItem('visibleColumns', JSON.stringify(updatedColumns));
      return updatedColumns;
    });
  }, []);

  const sortedTrips = useMemo(() => {
    if (!trips) return [];
    let filteredTrips = [...trips.trips];

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();

      // Attempt to parse the search query as a number
      const numericQuery = Number(searchQuery);
      const isNumericQuery = !isNaN(numericQuery);

      // Split the query for route matching
      const routeParts = lowercaseQuery.split(/\s*->\s*|\s+/).filter(Boolean);
      const queryOrigin = routeParts[0] || '';
      const queryDestination = routeParts[1] || '';

      // Route-based matching
      const routeMatches = filteredTrips.filter((trip) => {
        const origin = trip.route?.origin?.toLowerCase() || '';
        const destination = trip.route?.destination?.toLowerCase() || '';

        if (queryOrigin && queryDestination) {
          return (
            (origin.includes(queryOrigin) && destination.includes(queryDestination)) ||
            (origin.includes(queryDestination) && destination.includes(queryOrigin))
          );
        }

        return origin.includes(queryOrigin) || destination.includes(queryOrigin);
      });

      // Match other fields (strings and numbers)
      const otherFieldMatches = filteredTrips.filter((trip) =>
        Object.values(trip).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowercaseQuery);
          } else if (typeof value === 'number' && isNumericQuery) {
            return value === numericQuery || value.toString().includes(searchQuery);
          }
          return false;
        })
      );

      // Combine results
      const combinedResults = [...new Set([...routeMatches, ...otherFieldMatches])];

      filteredTrips = combinedResults;
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

  const handleEdit = useCallback(async (data: Partial<ITrip>) => {
    if (!selectedTrip) return;
    try {
      await editTrip({ tripId: selectedTrip.trip_id, tripData: data }).unwrap();
      toast({
        description: "Trip Edited Successfully",
      });
    } catch (error) {
      console.error('Error editing trip:', error);
      toast({
        description: "Error Editing Trip",
        variant: 'destructive'
      });
    } finally {
      setSelectedTrip(null);
      setEdit(false);
    }
  }, [selectedTrip, editTrip, toast]);

  if (isLoading) return <Loading />;
  if (error) return <div className="flex justify-center items-center h-full text-red-500">Error loading trips</div>;

  return (
    <div className="w-full p-4 h-full bg-white">
      <div className='flex w-full px-4 md:px-60'>
        <input
          type="text"
          placeholder={`Search from ${trips?.trips.length || 0} trips...`}
          onChange={handleSearch}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between mt-4">
        <div className="flex items-center bg-orange-100 rounded-sm text-orange-800 p-2 mb-2 md:mb-0">
          <span>Total Balance:</span>
          <span className="ml-2 text-lg font-bold">
            {trips ? formatNumber(trips.trips.reduce((acc, trip) => acc + trip.balance, 0)) : 'Calculating...'}
          </span>
        </div>
        <div className='flex items-end space-x-2 p-2'>
          <Select
            value={selectedStatus?.toString() ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {status}
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
          <Button onClick={()=>setInvoiceOpen(true)}>
          Generate Invoice
        </Button>
        </div>
        
      </div>

      {(!trips || trips.trips.length === 0) ? (
        <div className="flex justify-center items-center h-full text-gray-500">No trips found</div>
      ) : (
        <div className="w-full overflow-x-auto">
          {edit && <EditTripForm
            isOpen={edit}
            onClose={() => {
              setEdit(false);
              setSelectedTrip(null);
            }}
            trip={selectedTrip as ITrip}
            onSubmit={handleEdit}
          />}

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
              {sortedTrips.map((trip: ITrip, index: number) => (
                <TableRow
                  key={trip.trip_id}
                  className="hover:bg-orange-50 cursor-pointer transition-colors duration-200"
                  onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
                  index={index + 1}
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
      <InvoiceForm open={invoiceOpen} setOpen={setInvoiceOpen}/>
    </div>
  );
}

function renderCellContent(columnValue: string, trip: ITrip | any) {
  switch (columnValue) {
    case 'startDate':
      return (
        <div>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-orange-600" />
            <span>{new Date(trip.startDate).toLocaleDateString('en-IN')}</span>
          </div>
          <div>
            <span className='font-medium flex gap-[1px] text-xs text-gray-500 whitespace-nowrap'>
              EWB Validity :
              {ewbColor(trip)}
            </span>
          </div>
        </div>
      );
    case 'LR':
      return trip.LR;
    case 'truck':
      return (
        <>
        <div className="flex items-center space-x-2">
          <FaTruck className="text-orange-600" />
          <span>{trip.truck}</span>
        </div>
        <Link onClick={(e)=>e.stopPropagation()} href={`/user/drivers/${trip.driver}`}><Button variant={'link'} className="text-xs">{trip.driverName}</Button></Link>
        </>
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

