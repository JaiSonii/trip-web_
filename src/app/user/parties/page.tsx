// PartiesPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { IParty } from '@/utils/interface';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import PartyBalance from '@/components/party/PartyBalance';
import { FaPhone, FaUserTie } from 'react-icons/fa6';
import { GoOrganization } from "react-icons/go";
import { FaAddressBook, FaObjectGroup } from 'react-icons/fa';

const PartiesPage = () => {
  const router = useRouter();



  const [parties, setParties] = useState<IParty[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Contact Number</th>
              <th>Address</th>
              <th>GST Number</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party, index) => (
              <tr key={party.party_id as string} className="border-t w-full cursor-pointer" onClick={() => router.push(`/user/parties/${party.party_id}/trips`)}>
                <td>
                  <div className='flex items-center space-x-2'>
                    <GoOrganization className="text-bottomNavBarColor" />
                    <span>{party.name}</span>
                  </div>
                </td>
                <td>
                  <div className='flex items-center space-x-2'>
                    <FaUserTie className="text-bottomNavBarColor" />
                    <span>{party.contactPerson}</span>
                  </div>
                </td>
                <td>
                  <div className='flex items-center space-x-2'>
                    <FaPhone className="text-green-500" />
                    <span>{party.contactNumber}</span>
                  </div>
                </td>
                <td>
                  <div className='flex items-center space-x-2'>
                    <FaAddressBook className="text-bottomNavBarColor" />
                    <span>{party.address}</span>
                  </div></td>
                <td>{party.gstNumber}</td>
                <td><PartyBalance partyId={party.party_id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartiesPage;
