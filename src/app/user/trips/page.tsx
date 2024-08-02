// TripsPage.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import PartyName from '@/components/party/PartyName';
import { FaTruck, FaRoute, FaCalendarAlt, FaFileInvoiceDollar } from 'react-icons/fa';

const TripsPage = () => {
  const router = useRouter();

  const [trips, setTrips] = useState<ITrip[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch('/api/trips', {
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
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">No trips found</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className="table-container overflow-auto bg-white shadow rounded-lg">
        <table className="custom-table w-full border-collapse table-auto">
          <thead>
            <tr className="bg-orange-600 text-white">
              <th className="border p-4 text-left">Start Date</th>
              <th className="border p-4 text-left">LR Number</th>
              <th className="border p-4 text-left">Truck Number</th>
              <th className="border p-4 text-left">Party Name</th>
              <th className="border p-4 text-left">Route</th>
              <th className="border p-4 text-left">Status</th>
              <th className="border p-4 text-left">Party Balance</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, index) => (
              <tr
                key={index}
                className="border-t hover:bg-orange-100 cursor-pointer transition-colors"
                onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
              >
                <td className="border p-4 flex items-center space-x-2">
                  <FaCalendarAlt className="text-[rgb(247,132,50)]" />
                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                </td>
                <td className="border p-4">{trip.LR}</td>
                <td className="border p-4 flex items-center space-x-2">
                  <FaTruck className="text-[rgb(247,132,50)]" />
                  <span>{trip.truck}</span>
                </td>
                <td className="border p-4"><PartyName partyId={trip.party} /></td>
                <td className="border p-4 flex items-center space-x-2">
                  <FaRoute className="text-[rgb(247,132,50)]" />
                  <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                </td>
                <td className="border p-4">
                  <div className="flex flex-col items-center space-x-2">
                    <span>{statuses[trip.status as number]}</span>
                    <div className="relative w-full bg-gray-200 h-1 rounded">
                      <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="border p-4 flex items-center space-x-2">
                  <FaFileInvoiceDollar className="text-[rgb(247,132,50)]" />
                  <span>{fetchBalance(trip)}</span>
                </td>
              </tr>

            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripsPage;
