'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import PartyName from '@/components/party/PartyName';
import { FaTruck, FaRoute, FaCalendarAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const TripBalance = ({trip} : {trip : ITrip})=>{
  const [balance, setBalance] = useState(0)
  useEffect(()=>{
    if(trip){
      const balance = async ()=>{
        const pending = await fetchBalance(trip)
        setBalance(pending)
      }
      balance()
    }
  },[trip])

  return (
    <p className='text-green-600 font-semibold text-md'>{balance}</p>
  )
}

const columnOptions = [
  { label: 'Start Date', value: 'startDate' },
  { label: 'LR Number', value: 'LR' },
  { label: 'Truck Number', value: 'truck' },
  { label: 'Party Name', value: 'party' },
  { label: 'Route', value: 'route' },
  { label: 'Status', value: 'status' },
];

const TripsPage = () => {
  const router = useRouter();
  const [trips, setTrips] = useState<ITrip[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columnOptions.map(col => col.value));
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions.map(col => col.label));

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };



  const fetchTrips = useCallback(async (statuses: number[] = []) => {
    setLoading(true);
    setError(null);

    try {
      const queryParam = statuses.length > 0 ? `?statuses=${statuses.join(',')}` : '';
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
      const balances = await Promise.all(data.trips.map((trip: ITrip) => fetchBalance(trip)));
      setTotalBalance(balances.reduce((acc, balance) => acc + balance, 0));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips(selectedStatuses);
  }, [selectedStatuses, fetchTrips]);

  const handleStatusChange = (value: string) => {
    const status = parseInt(value);
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
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
    <div className="w-full h-full p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-lightOrange rounded-sm text-buttonTextColor p-2">
          <span>Total Balance :</span>
          {totalBalance !== null ? (
            <span className="ml-2 text-lg font-bold">{totalBalance}</span>
          ) : (
            <span className="ml-2 text-lg font-bold animate-pulse">Calculating...</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status, index) => (
                <SelectItem key={index} value={index.toString()}>
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(index)}
                    onChange={() => handleStatusChange(index.toString())}
                  />
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      {(!trips || trips.length === 0) ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">No trips found</div>
        </div>
      ) : (
        <div className="table-container overflow-auto bg-white shadow rounded-lg mt-4">
          <table className="custom-table w-full border-collapse table-auto">
            <thead>
              <tr className="bg-orange-600 text-white">
                {visibleColumns.includes('Start Date') && <th className="border p-4 text-left">Start Date</th>}
                {visibleColumns.includes('LR Number') && <th className="border p-4 text-left">LR Number</th>}
                {visibleColumns.includes('Truck Number') && <th className="border p-4 text-left">Truck Number</th>}
                {visibleColumns.includes('Party Name') && <th className="border p-4 text-left">Party Name</th>}
                {visibleColumns.includes('Route') && <th className="border p-4 text-left">Route</th>}
                {visibleColumns.includes('Status') && <th className="border p-4 text-left">Status</th>}
                <th>Party Balance</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip: ITrip | any, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
                >
                  {visibleColumns.includes('Start Date') && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-bottomNavBarColor" />
                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('LR Number') && <td className="border p-4">{trip.LR}</td>}
                  {visibleColumns.includes('Truck Number') && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <FaTruck className="text-bottomNavBarColor" />
                        <span>{trip.truck}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('Party Name') && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <GoOrganization className="text-bottomNavBarColor" />
                        <span><PartyName partyId={trip.party} /></span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('Route') && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <FaRoute className="text-bottomNavBarColor" />
                        <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('Status') && <td className="border p-4">
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
                            style={{ width: `${(trip.status + 1) * 20}%` }}
                          />

                        </div>
                      </div>
                    </td>}
                  <td><TripBalance trip={trip} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
