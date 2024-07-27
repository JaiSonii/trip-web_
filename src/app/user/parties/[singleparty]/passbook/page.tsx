'use client'

import TripRevenue from '@/components/trip/tripDetail/Profit/TripRevenue';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface ITrip {
  trip_id: string;
  startDate: Date;
  truck: string;
  route: {
    origin: string;
    destination: string;
  };
  amount: number;
}

interface IAccount {
  accountType: string;
  amount: number;
  paymentDate: Date;
  trip_id: string;
}

const SinglePartyPassbook = () => {
  const { singleparty } = useParams();
  const router = useRouter();

  const [partyAccount, setPartyAccount] = useState<(ITrip | IAccount)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartyData = async (partyId: string) => {
    try {
      const [accountRes, tripRes] = await Promise.all([
        fetch(`/api/trips/party/${partyId}/accounts`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`/api/trips/party/${partyId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      if (!accountRes.ok || !tripRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [accountData, tripData] = await Promise.all([
        accountRes.json(),
        tripRes.json(),
      ]);

      setPartyAccount([...accountData.accounts, ...tripData.trips]);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (singleparty) {
      fetchPartyData(singleparty as string);
    }
  }, [singleparty]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (partyAccount.length === 0) return <div>No transactions or trips for this party</div>;

  return (
    <div className="table-container flex flex-col justify-start gap-3">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Details</th>
            <th>Payment</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {partyAccount.map((acc: any, index) => (
            <tr
              key={index}
              className="border-t hover:bg-slate-100 cursor-pointer"
              onClick={() => router.push(`/user/trips/${acc.trip_id}`)}
            >
              <td>{new Date(acc.startDate || acc.paymentDate).toLocaleDateString()}</td>
              <td>{acc.accountType || `${acc.truck} - ${acc.route.origin.split(',')[0]} -> ${acc.route.destination.split(',')[1]}`}</td>
              <td>{acc.accountType ? acc.amount : ''}</td>
              <td>{acc.accountType ? '' : (<TripRevenue tripId={acc.trip_id} amount={acc.amount}/>)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SinglePartyPassbook;
