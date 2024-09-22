'use client'

import TripRevenue from '@/components/trip/tripDetail/Profit/TripRevenue';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaRoute, FaSort, FaSortDown, FaSortUp, FaTruck } from 'react-icons/fa';
import Loading from '../loading';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })

  const sortedAccounts = useMemo(() => {
    if (!partyAccount || partyAccount.length === 0) return []; // Ensure that partyAccount is not null or empty
    let sortableAccounts = [...partyAccount as any];

    if (sortConfig.key !== null) {
      sortableAccounts.sort((a, b) => {
        const aDate = a.startDate || a.paymentDate; // Use either startDate or paymentDate
        const bDate = b.startDate || b.paymentDate; // Use either startDate or paymentDate

        if (sortConfig.key === 'startDate' || sortConfig.key === 'paymentDate') {
          // Sort by date
          if (new Date(aDate) < new Date(bDate)) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (new Date(aDate) > new Date(bDate)) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        } else {
          // Sort by other fields like amount, revenue, etc.
          if (a[sortConfig.key!] < b[sortConfig.key!]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key!] > b[sortConfig.key!]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    }

    return sortableAccounts;
  }, [partyAccount, sortConfig]);


  const requestSort = (key: keyof ITrip | IAccount | any) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: keyof ITrip | IAccount | any) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  }

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
    <div className="">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead onClick={()=>requestSort('startDate')}>
              <div className='flex justify-between'>
              Date {getSortIcon('startDate')}
              </div>
              </TableHead>
            <TableHead>Details</TableHead>
            <TableHead onClick={()=>requestSort('amount')}>
            <div className='flex justify-between'>
              Payment {getSortIcon('amount')}
              </div>
            </TableHead>
            <TableHead onClick={()=>requestSort('revenue')}>
            <div className='flex justify-between'>
              Revenue {getSortIcon('revenue')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAccounts.map((acc: any, index) => (
            <TableRow
              key={index}
              className="border-t hover:bg-slate-100 cursor-pointer"
              onClick={() => router.push(`/user/trips/${acc.trip_id}`)}
            >
              <TableCell>
                <div className='flex items-center space-x-2'>
                  <FaCalendarAlt className='text-bottomNavBarColor' />
                  <span>{new Date(acc.startDate || acc.paymentDate).toLocaleDateString()}</span>
                </div>

              </TableCell>
              <TableCell className="p-4">
                {acc.accountType ? (
                  <span className="text-lg font-semibold">{acc.accountType}</span>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <FaTruck className="text-bottomNavBarColor text-2xl" />
                      <span className="ml-1 text-lg font-semibold text-gray-800">{acc.truck}</span>
                    </div>
                    <div className="flex items-center space-x-3 border-l-2 border-gray-200 pl-4">
                      <FaRoute className="text-bottomNavBarColor text-2xl" />
                      <span className="text-gray-700 text-md font-medium">
                        {acc.route.origin.split(',')[0]} &rarr; {acc.route.destination.split(',')[0]}
                      </span>
                    </div>
                  </div>

                )}
              </TableCell>



              <TableCell>{acc.accountType ? <span className='text-green-500 font-semibold'>₹{formatNumber(acc.amount)}</span> : ''}</TableCell>
              <TableCell><span className='text-green-500 font-semibold'>₹{acc.accountType ? '' : formatNumber(acc.revenue)}</span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SinglePartyPassbook;
