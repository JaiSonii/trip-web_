'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  const [totalBalance, setTotalBalance] = useState(0);

  // Memoized column options to prevent re-rendering unless changed
  const visibleColumns = useMemo(() => columnOptions.filter(col => selectedColumns.includes(col.value)), [selectedColumns]);

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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTotalBalance = useCallback(async () => {
    if (trips) {
      const balances = await Promise.all(trips.map(trip => fetchBalance(trip)));
      setTotalBalance(balances.reduce((acc, balance) => acc + balance, 0));
    }
  }, [trips]);

  useEffect(() => {
    fetchTrips(selectedStatuses);
  }, [selectedStatuses, fetchTrips]);

  useEffect(() => {
    calculateTotalBalance();
  }, [trips, calculateTotalBalance]);

  const handleStatusChange = (value: string) => {
    const status = parseInt(value);
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleColumnChange = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
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
          <span className="ml-2 text-lg font-bold">{totalBalance}</span>
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
          <Button
            className="bg-[#CC5500] text-white rounded-full px-4"
            onClick={() => setSelectedColumns(columnOptions.map(col => col.value))}
          >
            Reset Columns
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">Select Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columnOptions.map((col, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={col.value}
                  checked={selectedColumns.includes(col.value)}
                  onChange={() => handleColumnChange(col.value)}
                  className="form-checkbox h-4 w-4 text-orange-600"
                />
                <label htmlFor={col.value} className="text-gray-700">
                  {col.label}
                </label>
              </div>
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
                {visibleColumns.map(col => (
                  <th key={col.value} className="border p-4 text-left">
                    {col.label}
                  </th>
                ))}
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
                  {visibleColumns.includes(columnOptions[0]) && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-bottomNavBarColor" />
                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes(columnOptions[1]) && <td className="border p-4">{trip.LR}</td>}
                  {visibleColumns.includes(columnOptions[2]) && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <FaTruck className="text-bottomNavBarColor" />
                        <span>{trip.truck}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes(columnOptions[3]) && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <GoOrganization className="text-bottomNavBarColor" />
                        <span><PartyName partyId={trip.party} /></span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes(columnOptions[4]) && (
                    <td className="border p-4">
                      <div className="flex items-center space-x-2">
                        <FaRoute className="text-bottomNavBarColor" />
                        <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes(columnOptions[5]) && (
                    <td className="border p-4">
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
                            style={{ width: `${(trip.status + 1) * 25}%` }}
                          />

                        </div>
                      </div>
                    </td>
                  )}
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      <FaFileInvoiceDollar className="text-bottomNavBarColor" />
                      <span>{fetchBalance(trip)}</span>
                    </div>
                  </td>

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
