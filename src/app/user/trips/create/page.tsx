'use client'
import React, { useEffect, useState } from 'react';
import TripForm from '@/components/trip/TripForm';
import { IDriver, TruckModel, IParty, ITrip } from '@/utils/interface';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '../loading'; // Ensure the Loading component shows a GIF
import { useExpenseCtx } from '@/context/context';
import { useSWRConfig } from 'swr';

const CreateTripPage: React.FC = () => {
  

  const { trips } = useExpenseCtx();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // New state for saving overlay
  const [error, setError] = useState<string | null>(null);
  const [latestLR, setLatestLR] = useState<string>(''); // State to hold the latest LR
  const data  = useSearchParams()
  const duplicate = data.get('trip')

  const {mutate} = useSWRConfig()
  useEffect(()=>{
    mutate(`/api/trips`)
    mutate(`/api/trucks`)
    mutate(`/api/drivers`)
    mutate(`/api/parties`)
  },[mutate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch parties, trucks, drivers

        // Find the latest trip's LR
        if (trips && trips.length > 0) {
          const latestTrip = trips[0]; // Assuming the API returns trips sorted by date descending
          let lrString = latestTrip?.LR;
          if (lrString) {
            let num = parseInt(lrString.match(/\d+/)?.[0] || "0") + 1;
            const LR = `LRN ${typeof num === 'number' ? num : '001'}`;
            setLatestLR(LR); // Assuming 'LR' is the field containing LR in the trip object
          } else {
            setLatestLR('LRN 001');
          }
        } else {
          setLatestLR('LRN 001'); // No trips found
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTripSubmit = async (trip: any) => {
    setSaving(true); // Show loading overlay

    try {
      // Create a new FormData object
      const formData = new FormData();

      // Append all trip data to the formData object
      formData.append('party', trip.party);
      formData.append('truck', trip.truck);
      formData.append('driver', trip.driver);
      formData.append('supplierId', trip.supplierId);
      formData.append('origin', trip.route.origin);
      formData.append('destination', trip.route.destination);
      formData.append('billingType', trip.billingType);
      formData.append('perUnit', trip.perUnit.toString());
      formData.append('totalUnits', trip.totalUnits.toString());
      formData.append('amount', trip.amount.toString());
      formData.append('startDate', trip.startDate);
      formData.append('truckHireCost', trip.truckHireCost.toString());
      formData.append('LR', trip.LR);
      formData.append('material', trip.material);
      formData.append('notes', trip.notes);

      // Append the file to formData if it exists
      if (trip.file) {
        formData.append('file', trip.file);
      }

      // Append the EWB validity date if it exists
      if (trip.ewbValidity) {
        formData.append('ewbValidity', trip.ewbValidity);
      }

      // Make the request to create the trip
      const tripRes = await fetch('/api/trips', {
        method: 'POST',
        body: formData, // Send formData as the body
      });

      if (!tripRes.ok) {
        throw new Error('Failed to create trip');
      }

      // Update supplier truck hire cost if needed
      if (trip.supplierId) {
        const supplierRes = await fetch(`/api/suppliers/${trip.supplierId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ truckHireCost: trip.truckHireCost }), // Assuming truckHireCost is a field in trip
        });

        if (!supplierRes.ok) {
          throw new Error('Failed to update supplier');
        }
      }

      const data = await tripRes.json();
      router.push('/user/trips');
    } catch (error) {
      console.error('Error saving trip:', error);
      alert(`An error occurred while saving the trip. Please try again.: \n${error}`);
    } finally {
      
      setSaving(false); // Hide loading overlay
    }
  };


  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {saving && (
        <div className=''>
          <Loading /> {/* Ensure Loading component shows the GIF */}
        </div>
      )}
      <div className="w-full h-full relative">

        <TripForm onSubmit={handleTripSubmit} lr={latestLR} duplicate={duplicate ? JSON.parse(duplicate) : {}}/>
      </div>
    </>

  );
};

export default CreateTripPage;
