// TripsPage.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { IParty, ITrip, TripExpense } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { useRouter } from 'next/navigation';
import Loading from '@/app/user/loading';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import PartyName from '@/components/party/PartyName';

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
        setLoading(false)
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
    return <div>Error: {error}</div>;
  }

  if (!trips || trips.length === 0) {
    return <div>No trips found</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold mb-4">Trips</h1>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Start Date</th>
              <th className="border p-2">LR Number</th>
              <th className="border p-2">Party Name</th>
              <th className="border p-2">Truck Number</th>
              <th className="border p-2">Route</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Party Balance</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, index) => (
              <tr key={index} className="border-t hover:bg-slate-100 cursor-pointer" onClick={()=> router.push(`/user/trips/${trip.trip_id}`)}>
                <td className="border p-2">{new Date(trip.startDate).toLocaleDateString()}</td>
                <td className="border p-2">{trip.LR}</td>
                <td className="border p-2"><PartyName partyId={trip.party} /></td>

                <td className="border p-2">{trip.truck}</td>
                <td className="border p-2">{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</td>
                <td className="border p-2">{statuses[trip.status as number]}</td>
                <td className="border p-2">{fetchBalance(trip)}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripsPage;
