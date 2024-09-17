'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ITrip, IParty } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import { FaCalendarAlt, FaTruck, FaRoute, FaFileInvoiceDollar } from 'react-icons/fa';
import TripBalance from '@/components/trip/TripBalance';

// Dynamically import the Loading component
const Loading = dynamic(() => import('../loading'), {
  loading: () => <div>Loading...</div>,
});

const TruckTripsPage = () => {
  const router = useRouter();
  const { truckNo } = useParams();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<IParty[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/trips/truck/${truckNo}`);
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
    };

    const fetchParties = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/parties');
        if (!res.ok) {
          throw new Error('Failed to fetch parties');
        }
        const data = await res.json();
        setParties(data.parties);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
    fetchParties();
  }, [truckNo]);

  const renderedTrips = useMemo(() => (
    trips.map((trip, index) => (
      <tr
        key={trip.trip_id}
        className="border-t hover:bg-orange-100 cursor-pointer transition-colors"
        onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
      >
        <td className="border p-4 ">
          <div className='flex items-center space-x-2'>


            <FaCalendarAlt className="text-[rgb(247,132,50)]" />
            <span>{new Date(trip.startDate).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="border p-4">{trip.LR}</td>
        <td className="border p-4">
          <div className='flex items-center space-x-2'>
            <FaTruck className="text-[rgb(247,132,50)]" />
            <span>{trip.truck}</span>
          </div>
        </td>
        <td className="border p-4 ">
          <div className='flex items-center space-x-2'>
            <FaRoute className="text-[rgb(247,132,50)]" />
            <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
          </div>

        </td>
        <td className="border p-4">
          <div className="flex flex-col items-center space-x-2">
            <span>{statuses[trip.status as number]}</span>
            <div className="relative w-full bg-gray-200 h-1 rounded">
              <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
            </div>
          </div>
        </td>
        <td className="border p-4">
          <div className='flex items-center space-x-2'>
            <FaFileInvoiceDollar className="text-[rgb(247,132,50)]" />
            <span><TripBalance trip={trip} /></span>
          </div>
        </td>
      </tr>
    ))
  ), [trips, parties, router]);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      {error && <div className="text-red-500">{error}</div>}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>LR Number</th>
              <th>Party Name</th>
              <th>Route</th>
              <th>Status</th>
              <th>Party Balance</th>
            </tr>
          </thead>
          <tbody>
            {renderedTrips}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(TruckTripsPage);
