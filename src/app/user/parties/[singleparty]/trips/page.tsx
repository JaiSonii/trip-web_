'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { fetchBalance } from '@/helpers/fetchTripBalance';

const SinglePartyTrips = () => {
  const router = useRouter();
  const { singleparty } = useParams();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div>Loading...</div>;
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
              className="border-t hover:bg-slate-100 cursor-pointer"
              onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
            >
              <td>{new Date(trip.startDate).toLocaleDateString()}</td>
              <td>{trip.LR}</td>
              <td>{trip.truck}</td>
              <td>{trip.route.origin} -&gt; {trip.route.destination}</td>
              <td>{statuses[trip.status as number]}</td>
              <td>{fetchBalance(trip)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SinglePartyTrips;
