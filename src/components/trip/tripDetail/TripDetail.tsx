import React, { useEffect, useState } from 'react';
import { ITrip } from '@/utils/interface';
import TruckHeader from './TruckHeader';
import TripInfo from './TripInfo';
import TripStatus from './TripStatus';
import StatusButton from './TripFunctions/StatusButton'; // Replace with your actual StatusButton component
import ViewBillButton from './TripFunctions/ViewBill'; // Replace with your actual ViewBillButton component
import Advances from './Advances';
import Charges from './Charges';
import Payments from './Payments';
import Profit from './Profit';
import PODViewer from './PODViewer';


const advances = [
  { label: 'Advance 1', value: '₹ 5000' },
  { label: 'Advance 2', value: '₹ 3000' },
  { label: 'Advance 3', value: '₹ 2000' },
];

const charges = [
  { label: 'Charge 1', value: '₹ 1000' },
  { label: 'Charge 2', value: '₹ 500' },
];

const payments = [
  { label: 'Payment 1', value: '₹ 4000' },
  { label: 'Payment 2', value: '₹ 2500' },
];

const profit = { label: 'Profit', value: '₹ 3000' }; // Demo profit data

const podUrl = ""; 

interface TripDetailsProps {
  trip: ITrip;
  setTrip: any;
}

const TripDetails: React.FC<TripDetailsProps> = ({ trip, setTrip }) => {
  const [partyName, setPartyName] = useState('');

  useEffect(() => {
    const fetchPartyName = async () => {
      try {
        const partyRes = await fetch(`/api/parties/${trip.party}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!partyRes.ok) {
          throw new Error('Failed to fetch Party details');
        }
        const partyData = await partyRes.json();
        setPartyName(partyData.party.name);
      } catch (error) {
        console.log('Error fetching party name:', error);
      }
    };
    fetchPartyName();
  }, [trip]);

  const handleStatusUpdate = async (data: any) => {
    // Implement functionality to settle amount here
    console.log(data);
    try {
      const res = await fetch(`/api/trips/${trip.tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        throw new Error('Failed to settle amount');
      }
      const resData = await res.json();
      setTrip(resData.trip);
    } catch (error) {
      console.log('Error settling amount:', error);
    }

    console.log('Settle amount button clicked');
  };

  const podUrl = `/pod/${trip.podImage || 'default.jpg'}`; // Assuming podImage path

  return (
    <div className="p-6 bg-white shadow-md rounded-md grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Side - Trip Details */}
      <div className="col-span-2 pr-4">
        <TruckHeader truck={trip.truck} driver={trip.driver} />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TripInfo label="Party Name" value={partyName || '----'} />
          <div className="flex flex-col md:flex-row md:gap-6">
            <TripInfo label="LR Number" value={trip.LR || '----'} />
            <TripInfo label="Material" value={trip.material || '----'} />
          </div>
          <TripInfo label="Route" value={`${trip.route.origin} → ${trip.route.destination}`} />
          <TripInfo label="Billing Type" value={trip.billingType || '----'} />
        </div>

        <div className="mt-6 w-full">
          <TripStatus status={trip.status} dates={trip.dates} />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TripInfo label="Amount" value={`₹ ${trip.amount.toLocaleString()}`} />
          <TripInfo label="Start Date" value={new Date(trip.startDate).toLocaleDateString()} />
          <TripInfo label="End Date" value={trip.dates[1] ? new Date(trip.dates[1]).toLocaleDateString() : '----'} />
          <TripInfo label="Notes" value={trip.notes || 'No notes available'} />
        </div>

        {/* Reusable Components */}
        <Advances advances={advances} /><br />
        <Charges charges={charges} /><br />
        <Payments payments={payments} /><br />
      </div>

      {/* Right Side - Profit and POD Viewer */}
      <div className="col-span-1">
        <Profit label="Profit" value={""} />
        <PODViewer podUrl={podUrl} />
      </div>

      {/* Buttons Section */}
      <div className="col-span-3 mt-6 flex justify-start space-x-4">
        <div className="flex items-center space-x-4">
          <StatusButton status={trip.status} statusUpdate={handleStatusUpdate} dates={trip.dates} amount={trip.amount}/>
          <ViewBillButton />
          {/* Add more buttons as needed */}
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
