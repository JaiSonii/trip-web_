'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { FaCalendarAlt, FaTruck, FaRoute,FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import Loading from '../loading';
import PartyName from '@/components/party/PartyName';
import { GoOrganization } from 'react-icons/go';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DriverTrips: React.FC = () => {
  const router = useRouter();
  const { driverId } = useParams();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })

  const sortedTrips = useMemo(() => {
    if (!trips || trips.length === 0) return []; // This line ensures that trips is not null or empty
    let sortableTrips = [...trips as any];
    if (sortConfig.key !== null) {
      sortableTrips.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTrips;
  }, [trips, sortConfig]);


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

  useEffect(() => {
    const fetchDriverTrips = async () => {
      try {
        const res = await fetch(`/api/trips/driver/${driverId}`);
        if (!res.ok) throw new Error('Failed to fetch trips');
        const data = await res.json();
        setTrips(data.trips);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchDriverTrips();
    }
  }, [driverId]);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (trips.length === 0) return <div>No trips for this driver</div>;

  return (
    <div className="table-container flex flex-col justify-start gap-3">

      <Table className="custom-table">
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('startDate')}>
              <div className='flex justify-between'>
                Start Date {getSortIcon('startDate')}
              </div>
            </TableHead>
            <TableHead>Truck Number</TableHead>
            <TableHead>Route</TableHead>
            <TableHead onClick={() => requestSort('status')}>
              <div className='flex justify-between'>
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort('partyName')}>
              <div className='flex justify-between'>
                Party Name {getSortIcon('partyName')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrips.map((trip) => (
            <TableRow
              key={trip.trip_id}
              className="border-t hover:bg-orange-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
            >
              <TableCell className="border p-4">
                <div className='flex items-center space-x-2'>
                  <FaCalendarAlt className="text-bottomNavBarColor" />
                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <div className='flex items-center space-x-2'>
                  <FaTruck className="text-bottomNavBarColor" />
                  <span>{trip.truck}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <div className='flex items-center space-x-2'>
                  <FaRoute className="text-bottomNavBarColor" />
                  <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <div className="flex flex-col items-center space-x-2">
                  <span>{statuses[trip.status as number]}</span>
                  <div className="relative w-full bg-gray-200 h-1 rounded">
                    <div
                      className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`}
                      style={{ width: `${(trip.status as number / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <div className='flex items-center space-x-2'>
                  <GoOrganization className="text-bottomNavBarColor" />
                  <span>{trip.partyName}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverTrips;
