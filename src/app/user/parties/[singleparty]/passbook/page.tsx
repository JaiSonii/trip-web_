'use client'

import TripRevenue from '@/components/trip/tripDetail/Profit/TripRevenue';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaRoute, FaTruck } from 'react-icons/fa';
import Loading from '../loading';

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

  if (loading) return <Loading />;
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
              <td>
                <div className='flex items-center space-x-2'>
                <FaCalendarAlt className='text-bottomNavBarColor' />
                <span>{new Date(acc.startDate || acc.paymentDate).toLocaleDateString()}</span>
                </div>
                
              </td>
              <td className="p-4">
                {acc.accountType ? (
                  <span className="text-lg font-semibold">{acc.accountType}</span>
                ) : (
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaTruck className="text-[rgb(247,132,50)]" />
                      <span className="ml-1 text-lg font-medium">{acc.truck}</span>
                    </div>
                    <hr className="border-gray-300 my-1" />
                    <div className="flex items-center space-x-2 mt-2">
                      <FaRoute className="text-[rgb(247,132,50)]" />
                      <span className="text-gray-600 text-md">
                        {acc.route.origin.split(',')[0]} &rarr; {acc.route.destination.split(',')[0]}
                      </span>
                    </div>
                  </div>
                )}
              </td>



              <td>{acc.accountType ? acc.amount : ''}</td>
              <td>{acc.accountType ? '' : (<TripRevenue tripId={acc.trip_id} amount={acc.amount} />)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SinglePartyPassbook;
