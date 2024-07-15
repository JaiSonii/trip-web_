'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { IDriver, IParty, ITrip, TruckModel } from '@/utils/interface';
import { useParams, useRouter } from 'next/navigation';
import TripDetails from '@/components/trip/tripDetail/TripDetail';
import Loading from '@/app/loading';
import { MdEdit, MdDelete, MdClose } from 'react-icons/md';

// Dynamically import EditTripForm
const EditTripForm = dynamic(() => import('@/components/trip/EditTripForm'), {
  loading: () => <Loading />,
  ssr: false,
});

const useFetchData = (tripId: string) => {
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [parties, setParties] = useState<IParty[]>([]);
  const [trucks, setTrucks] = useState<TruckModel[]>([]);
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripRes = await fetch(`/api/trips/${tripId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!tripRes.ok) throw new Error('Failed to fetch trip details');

        const tripData = await tripRes.json();

        setTrip(tripData.trip);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchData();
    }
  }, [tripId]);

  const handleEditClicked = async () => {
    setLoading(true);
    try {
      const [partiesRes, trucksRes, driversRes] = await Promise.all([
        fetch('/api/parties', { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch('/api/trucks', { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch('/api/drivers', { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      ]);

      if (!partiesRes.ok) throw new Error('Failed to fetch parties');
      if (!trucksRes.ok) throw new Error('Failed to fetch trucks');
      if (!driversRes.ok) throw new Error('Failed to fetch drivers');

      const [partiesData, trucksData, driversData] = await Promise.all([
        partiesRes.json(),
        trucksRes.json(),
        driversRes.json(),
      ]);

      setParties(partiesData.parties);
      setTrucks(trucksData.trucks);
      setDrivers(driversData.drivers);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { trip, parties, trucks, drivers, loading, error, setTrip, handleEditClicked };
};

const TripPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = useParams();
  const { trip, parties, trucks, drivers, loading, error, setTrip, handleEditClicked } = useFetchData(tripId as any);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = useCallback(async (data: Partial<ITrip>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });

      const driverRes = await fetch(`/api/drivers/${trip?.driver}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
      });

      if (!driverRes.ok) throw new Error('Failed to update driver status');

      const truckRes = await fetch(`/api/trucks/${trip?.truck}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
      });

      if (!truckRes.ok) throw new Error('Failed to update truck status');
      if (!res.ok) throw new Error('Failed to edit trip');

      const newData = await res.json();
      if (newData.status == 400) {
        alert(newData.message);
        setIsSubmitting(false);
        return;
      }
      setTrip(newData.trip);
      setIsEditing(false); // Close editing mode after successful edit
      router.refresh();
    } catch (error) {
      console.error('Error editing trip:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [trip, tripId, router, setTrip]);

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to delete trip');
      router.push('/user/trips'); // Redirect to trips list after deletion
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  }, [tripId, router]);

  if (loading || isSubmitting) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="mx-auto p-4">
      {!isEditing && (
        <div className="flex justify-end space-x-4 mb-4">
          <button
            onClick={() => {
              handleEditClicked();
              setIsEditing(true);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md shadow-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <MdEdit className="mr-2" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-md shadow-lg hover:from-red-400 hover:to-red-600 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <MdDelete className="mr-2" /> Delete
          </button>
        </div>
      )}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-2xl">
            <button
              onClick={handleCancelEdit}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              <MdClose size={24} />
            </button>
            <EditTripForm
              parties={parties}
              trucks={trucks}
              trip={trip as any}
              drivers={drivers}
              onSubmit={handleEdit}
            />
          </div>
        </div>
      )}
      <TripDetails trip={trip as any} setTrip={setTrip} />
    </div>
  );
};

export default TripPage;
