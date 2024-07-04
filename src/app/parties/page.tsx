// PartiesPage.tsx
'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IParty } from '@/utils/interface';

const PartiesPage = () => {
  const [parties, setParties] = useState<IParty[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/parties', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch parties');
        }

        const data = await res.json(); // Parse the response body as JSON
        setParties(data.parties);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!parties || parties.length === 0) {
    return <div>No parties found</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold mb-4">Parties</h1>
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
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party, index) => (
              <tr key={party._id as string} className="border-t">
                <td>{party.name}</td>
                <td>{party.contactPerson}</td>
                <td>{party.contactNumber}</td>
                <td>{party.address}</td>
                <td>{party.gstNumber}</td>
                <td>{party.balance}</td>
                <td>
                  <Link href={`/parties/${party.party_id}/trips`} className="text-blue-500 hover:underline cursor-pointer">
                    View Trips
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartiesPage;
