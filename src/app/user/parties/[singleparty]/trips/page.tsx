'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { FaCalendarAlt, FaTruck, FaRoute, FaFileInvoiceDollar, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import Loading from '../loading';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParty } from '@/context/partyContext';

const SinglePartyTrips = () => {
  const { party, loading } = useParty();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ITrip | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Memoized sorted trips
  const sortedTrips = useMemo(() => {
    if (!party?.items || party?.items?.length === 0) return []; // Ensure trips is not null or empty
    let sortableTrips: ITrip[] = [];

    // Filter trips based on type
    party.items.forEach((item: any) => {
      if (item.type === 'trip') sortableTrips.push(item);
    });

    // Apply sorting if sortConfig key is not null
    if (sortConfig.key) {
      sortableTrips.sort((a: ITrip, b: ITrip) => {
        const aValue = a[sortConfig.key as keyof ITrip];
        const bValue = b[sortConfig.key as keyof ITrip];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortableTrips;
  }, [party, sortConfig]);

  // Function to request sorting
  const requestSort = (key: keyof ITrip) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Function to get sort icon
  const getSortIcon = (columnName: keyof ITrip) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (party?.items?.length === 0) return <div>No trips for this party</div>;

  return (
    <div className="">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('startDate')}>
              <div className='flex justify-between'>
                Start Date {getSortIcon('startDate')}
              </div>
            </TableHead>
            <TableHead>LR Number</TableHead>
            <TableHead>Truck Number</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            <TableHead onClick={() => requestSort('balance')}>
              <div className='flex justify-between'>
                Party Balance {getSortIcon('balance')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrips?.map((trip: any) => (
            <TableRow
              key={trip.trip_id}
              className="border-t hover:bg-orange-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
            >
              <TableCell className="border p-4 ">
                <div className='flex items-center space-x-2'>
                  <FaCalendarAlt className="text-bottomNavBarColor" />
                  <span>{new Date(trip?.date).toLocaleDateString()}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">{trip?.LR || '...'}</TableCell>
              <TableCell className="border p-4 ">
                <div className='flex items-center space-x-2'>
                  <FaTruck className="text-bottomNavBarColor" />
                  <span>{trip?.truck}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4 ">
                <div className='flex items-center space-x-2'>
                  <FaRoute className="text-bottomNavBarColor" />
                  <span>{trip?.description?.origin.split(',')[0]} -&gt; {trip?.description?.destination.split(',')[0]}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <div className="flex flex-col items-center space-x-2">
                  <span>{statuses[trip?.status as number]}</span>
                  <div className="relative w-full bg-gray-200 h-1 rounded">
                    <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <div className='flex items-center space-x-2'>
                  <FaFileInvoiceDollar className="text-bottomNavBarColor" />
                  <span className='text-green-500 font-semibold'>₹{formatNumber(trip?.balance)}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SinglePartyTrips;
