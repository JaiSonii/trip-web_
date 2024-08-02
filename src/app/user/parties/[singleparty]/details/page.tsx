'use client';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Loading from '../loading';

interface Party {
  address: string;
  balance: number;
  contactNumber: string;
  contactPerson: string;
  gstNumber: string;
  name: string;
  party_id: string;
  user_id: string;
}

const PartyDetails = () => {
  const router = useRouter();
  const { singleparty } = useParams();
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchPartyDetails = async (partyId: string) => {
    try {
      const res = await fetch(`/api/parties/${partyId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch party details');
      }
      const data = await res.json();
      setParty(data.party);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (party) {
      setParty({ ...party, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (party) {
      try {
        const res = await fetch(`/api/parties/${party.party_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(party),
        });
        if (!res.ok) {
          throw new Error('Failed to update party details');
        }
        setIsEditing(false);
        // Optionally refetch data
        
      } catch (err: any) {
        alert(err.message)
      }finally{
        fetchPartyDetails(singleparty as string)
      }
    }
  };

  const handleDelete = async () => {
    if (party) {
      try {
        const res = await fetch(`/api/parties/${party.party_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error('Failed to delete party');
        }
        router.push('/user/parties');
      } catch (err: any) {
        console.log(err)
        alert(err.message)
      }
    }
  };

  useEffect(() => {
    if (singleparty) {
      fetchPartyDetails(singleparty as string);
    }
  }, [singleparty]);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h1 className="text-2xl font-bold mb-4">Party Details</h1>
      {party && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSave}>
          <div>
            <label className="block font-medium text-gray-700">Name:</label>
            <input
              type="text"
              name="name"
              value={party.name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Contact Person:</label>
            <input
              type="text"
              name="contactPerson"
              value={party.contactPerson || ''}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Contact Number:</label>
            <input
              type="text"
              name="contactNumber"
              value={party.contactNumber || ''}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">GST Number:</label>
            <input
              type="text"
              name="gstNumber"
              value={party.gstNumber || ''}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Address:</label>
            <input
              type="text"
              name="address"
              value={party.address || ''}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              disabled={!isEditing}
            />
          </div>
          <div className="flex justify-between col-span-2">
            <div className="mt-6 flex space-x-4">
              {isEditing ? (
                <>
                  <Button type="submit" variant="ghost">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
              )}
              <Button type="button" onClick={() => router.push('/user/parties')}>Back to Parties List</Button>
            </div>
            <div className='mt-6 flex space-x-4'>
              <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default PartyDetails;
