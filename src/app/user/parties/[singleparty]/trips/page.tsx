'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import { FaCalendarAlt, FaTruck, FaRoute, FaFileInvoiceDollar } from 'react-icons/fa';
import Loading from '../loading';

const SinglePartyTrips = () => {
  const router = useRouter();
  const { singleparty } = useParams();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(singleparty)

  useEffect(() => {
    if (singleparty) {
      fetchPartyTrips(singleparty as string);
    }
  }, [singleparty]);

  const fetchPartyTrips = async (partyId: string) => {
    setLoading(true);
    try {
      const tripsResponse = await fetch(`/api/trips/party/${partyId}`);

      if (!tripsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const tripsData = await tripsResponse.json();

      setTrips(tripsData.trips);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (trips.length === 0) return <div>No trips for this party</div>;

  return (
    <div className="table-container flex flex-col justify-start gap-3">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Start Date</th>
            <th>LR Number</th>
            <th>Truck Number</th>
            <th>Route</th>
            <th>Status</th>
            <th>Party Balance</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr
              key={trip.trip_id}
              className="border-t hover:bg-orange-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
            >
              <td className="border p-4 ">
                <div className='flex items-center space-x-2'>
                  <FaCalendarAlt className="text-bottomNavBarColor" />
                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="border p-4">{trip.LR}</td>
              <td className="border p-4 ">
                <div className='flex items-center space-x-2'>
                  <FaTruck className="text-bottomNavBarColor" />
                  <span>{trip.truck}</span>
                </div>
              </td>
              <td className="border p-4 ">
                <div className='flex items-center space-x-2'>
                  <FaRoute className="text-bottomNavBarColor" />
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
                <FaFileInvoiceDollar className="text-bottomNavBarColor" />
                <span>{fetchBalance(trip)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SinglePartyTrips;
