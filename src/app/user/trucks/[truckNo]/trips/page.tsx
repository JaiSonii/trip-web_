'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ITrip, IParty } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { fetchBalance } from '@/helpers/fetchTripBalance';

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
        key={index}
        className="border-t hover:bg-slate-100 cursor-pointer"
        onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
      >
        <td>{new Date(trip.startDate).toLocaleDateString()}</td>
        <td>{trip.LR}</td>
        <td>{parties.find(party => party.party_id === trip.party)?.name || 'N/A'}</td>
        <td>{trip.truck}</td>
        <td>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</td>
        <td>{statuses[trip.status as number]}</td>
        <td>{fetchBalance(trip)}</td>
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
              <th>Truck Number</th>
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
