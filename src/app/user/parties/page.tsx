// PartiesPage.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { IParty } from '@/utils/interface';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import PartyBalance from '@/components/party/PartyBalance';
import { FaPhone, FaSort, FaSortDown, FaSortUp, FaUserTie } from 'react-icons/fa6';
import { GoOrganization } from "react-icons/go";
import { FaAddressBook, FaObjectGroup } from 'react-icons/fa';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PartiesPage = () => {
  const router = useRouter();



  const [parties, setParties] = useState<IParty[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })

  const sortedParties = useMemo(() => {
    if (!parties || parties.length === 0) return []; // This line ensures that trips is not null or empty
    let sortableTrips = [...parties as any];
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
  }, [parties, sortConfig]);


  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: any) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  }

  useEffect(() => {
    const fetchParties = async () => {

      try {
        const res = await fetch('/api/parties', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json(); // Parse the response body as JSON
          console.log(data)
          setParties(data.parties);
          setLoading(false)
        }


      } catch (err) {

        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!parties || parties.length === 0) {
    return <div>No parties found</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('name')}>
                <div className='flex justify-between'>
                  Name {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead onClick={() => requestSort('partyBalance')}>
                <div className='flex justify-between'>
                  Balance {getSortIcon('partyBalance')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParties.map((party, index) => (
              <TableRow key={party.party_id as string} className="border-t w-full cursor-pointer" onClick={() => router.push(`/user/parties/${party.party_id}/trips`)}>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <GoOrganization className="text-bottomNavBarColor" />
                    <span>{party.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaUserTie className="text-bottomNavBarColor" />
                    <span>{party.contactPerson}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaPhone className="text-green-500" />
                    <span>{party.contactNumber}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaAddressBook className="text-bottomNavBarColor" />
                    <span>{party.address}</span>
                  </div></TableCell>
                <TableCell>{party.gstNumber}</TableCell>
                <TableCell><span className='text-green-600 font-semibold'>₹{formatNumber(party.partyBalance) || ''}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PartiesPage;
