'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { IDriver, IParty, ITrip, TruckModel } from '@/utils/interface';
import { useParams, useRouter } from 'next/navigation';
import { MdEdit, MdDelete, MdClose } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Loading from '../loading';
import { useTrip } from '@/context/tripContext';
import { Frown, Loader2 } from 'lucide-react';

// Dynamically import components
const TripDetails = dynamic(() => import('@/components/trip/tripDetail/TripDetail'), {
  loading: () => <div className='flex items-center justify-center'> <Loader2 className='animate-spin text-bottomNavBarColor' /></div>,
  ssr: false,
});
const EditTripForm = dynamic(() => import('@/components/trip/EditTripForm'), {
  loading: () => <div className='flex items-center justify-center'> <Loader2 className='animate-spin text-bottomNavBarColor' /></div>,
  ssr: false,
});


const TripPage: React.FC = () => {
  const { trip, setTrip, loading } = useTrip();
  const router = useRouter();
  const { tripId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false)
  const [error, setError] = useState('')

  const TripDocumentUpload = dynamic(()=> import('@/components/documents/TripDocumentUpload'), {ssr : false})

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
      if (newData.status === 400) {
        alert(newData.message);
        setIsSubmitting(false);
        return;
      }
      setTrip((prev : ITrip | any)=>({
        ...prev,
        ...newData.trip
      }));
      setIsEditing(false); // Close editing mode after successful edit

    } catch (error) {
      console.error('Error editing trip:', error);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
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

  if(!trip){
    return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Trip Not Found</div>
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="mx-auto p-4">
      <div className='flex items-center justify-between'>
        <Button onClick={()=>setDocModalOpen(true)}>
          Upload Document
        </Button>
        <div className="flex justify-end space-x-4 mb-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(true);
            }}
            className="transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <MdEdit className="mr-2" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <MdDelete className="mr-2" /> Delete
          </Button>
        </div>
      </div>


      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0, 0.71, 0.2, 1.01]
            }} className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-3xl max-h-[90vh] overflow-y-auto thin-scrollbar">
            <Button
              variant="ghost"
              onClick={handleCancelEdit}
              className="absolute top-0 right-0 text-gray-600 hover:text-gray-900"
            >
              <MdClose size={24} />
            </Button>
            <EditTripForm
              trip={trip as ITrip}
              onSubmit={handleEdit}
            />
          </motion.div>
        </div>
      )}
      <TripDetails />
      {docModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <TripDocumentUpload open={docModalOpen} setOpen={setDocModalOpen} tripId={tripId as string} />
        </div>
      )}
    </div>
  );
};

export default TripPage;
