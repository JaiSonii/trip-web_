import React, { useEffect, useState } from 'react';
import { ITrip, PaymentBook, TripExpense, } from '@/utils/interface';
import TruckHeader from './TruckHeader';
import TripInfo from './TripInfo';
import TripStatus from './TripStatus';
import StatusButton from './TripFunctions/StatusButton'; // Replace with your actual StatusButton component
import ViewBillButton from './TripFunctions/ViewBill'; // Replace with your actual ViewBillButton component
import Profit from './Profit';
import PODViewer from './PODViewer';
import DataList from './DataList';
import Charges from './Charges'; // Import the Charges component
import { fetchBalance } from '@/helpers/fetchTripBalance';
import { fetchPartyName } from '@/helpers/fetchPartyName';
import EWayBillUpload from './EwayBillUpload';
import { Button } from '@/components/ui/button';
import { UndoIcon } from 'lucide-react';
import { formatNumber } from '@/utils/utilArray';

interface TripDetailsProps {
  trip: ITrip;
  setTrip: any;
}

const TripDetails: React.FC<TripDetailsProps> = ({ trip, setTrip }) => {
  const [partyName, setPartyName] = useState('');
  const [accounts, setAccounts] = useState<PaymentBook[]>(trip.accounts);
  const [tripBalance, setBalance] = useState(0);
  const [charges, setCharges] = useState<TripExpense[]>([])
  const [ewayBillUrl, setEwayBillUrl] = useState(trip.ewayBill)

  useEffect(() => {
    const balance = async () => {
      if (trip) {
        const pending = await fetchBalance(trip)
        setBalance(pending)
      }
    }
    balance()

  }, [trip, charges, accounts])

  useEffect(() => {
    const fetchParty = async () => {
      try {
        const name = await fetchPartyName(trip.party)
        setPartyName(name);
      } catch (error: any) {
        console.log('Error fetching party name:', error);
        alert(error.message)
      }
    };
    const fetchCharges = async () => {
      const response = await fetch(`/api/trips/${trip.trip_id}/expenses`);
      const data = await response.json();
      setCharges(data.charges);
    }
    if (charges) {
      const sorted = [...charges].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCharges(sorted);
    }
    fetchCharges()
    fetchParty();
  }, [trip]);

  const handleUndoStatus = async ()=>{
    const updateDates = (dates: (Date | null)[]): (Date | null)[] => {
      // Create a copy of the array to avoid mutating the original array
      const updatedDates = [...dates];
      
      for (let i = 1; i < updatedDates.length; i++) {
        if (updatedDates[i] === null) {
          updatedDates[i - 1] = null;
        }
      }
      
      return updatedDates;
    };
    if(trip.status == 0){
      alert('Cannot Undo the Status')
      return
    }
    const data = {
      status : trip.status ? trip.status - 1 : alert('No Trip Status'),
      dates : updateDates(trip.dates)
    }
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
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
      console.log(resData)
      setTrip(resData.trip);
    } catch (error) {
      alert(error)
      console.log('Error settling amount:', error);
    }
  }

  const handleStatusUpdate = async (data: any) => {
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
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
      alert(error)
      console.log('Error settling amount:', error);
    }

    if (data.status === 1) {
      try {
        const driverRes = await fetch(`/api/drivers/${trip.driver}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
        });
        if (!driverRes.ok) {
          throw new Error('Failed to update driver status');
        }
        const truckRes = await fetch(`/api/trucks/${trip.truck}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
        });
        if (!truckRes.ok) {
          throw new Error('Failed to update truck status');
        }
      } catch (error: any) {
        console.log(error);
        alert(error.message)
      }
    }

    if (data.status === 4) {
      try {
        const res = await fetch(`/api/trips/${trip.trip_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              account: {
                accountType: 'Payments',
                receivedByDriver: data.receivedByDriver,
                amount: data.amount,
                paymentType: data.paymentType,
                paymentDate: data.dates[4],
                notes: data.notes,
              },
            },
          }),
        });
        if (!res.ok) {
          throw new Error('Failed to add new item');
        }
        const resData = await res.json();
        setAccounts(resData.trip.accounts);
        setTrip(resData.trip)
      } catch (error: any) {
        alert(error.message);
        console.log(error);
      }
    }

  };

  const handleAddCharge = (newCharge: any) => {
    // Add logic to handle adding the new charge
  };

  

  return (
    <div className="p-6 bg-white shadow-md rounded-md grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Side - Trip Details */}
      <div className="col-span-2 pr-4">
        <TruckHeader truck={trip.truck} driver={trip.driver} />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <TripInfo label="Party Name" value={partyName || '----'} />
          <div className="flex flex-col md:flex-row md:gap-6">
            <TripInfo label="LR Number" value={trip.LR || '----'} />
            <TripInfo label="Material" value={trip.material || '----'} />
            <TripInfo label="Billing Type" value={trip.billingType || '----'} />
          </div>
          
        </div>
        <TripInfo label="Route" value={`${trip.route.origin} → ${trip.route.destination}`} />
        <div className="mt-6 w-full">
          <TripStatus status={trip.status as number} dates={trip.dates} />
        </div>
        <div className="col-span-3 mt-6 flex justify-start space-x-4">
          <div className="flex items-center space-x-4">
            <StatusButton status={trip.status as number} statusUpdate={handleStatusUpdate} dates={trip.dates} amount={tripBalance} />
            <ViewBillButton />
            <Button variant={'destructive'} onClick={handleUndoStatus}>
              <div className='flex items-center space-x-2'>
                <UndoIcon />
                <span>Undo Status</span>
              </div>
            </Button>
            {/* Add more buttons as needed */}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-6 py-4">
          <TripInfo label="Freight Amount" value={`₹ ${formatNumber(trip.amount)}`} />
          <TripInfo label="Start Date" value={new Date(trip.startDate).toLocaleDateString()} />
          <TripInfo label="End Date" value={trip.dates[1] ? new Date(trip.dates[1]).toLocaleDateString() : '----'} />
          
        </div>
        <TripInfo label="Notes" value={trip.notes || 'No notes available'} tripId={trip.trip_id} />

        {/* Reusable Components */}
        <DataList data={accounts} label="Advances" modalTitle="Add Advance" trip={trip} setData={setAccounts} setBalance={setBalance} setTrip={setTrip} />
        <DataList data={accounts} label="Payments" modalTitle="Add Payment" trip={trip} setData={setAccounts} setBalance={setBalance} setTrip={setTrip} />

        {/* Charges Component Integration */}
        <Charges charges={charges} onAddCharge={handleAddCharge} setCharges={setCharges} tripId={trip.trip_id} trip={trip} />
      </div>

      {/* Right Side - Profit, Balance, and POD Viewer */}
      <div className="col-span-1 space-y-6">
        <div className="flex items-center justify-between bg-gradient-to-r p-4 from-orange-500 via-bottomNavBarColor to-bottomNavBarColor rounded-lg shadow-lg text-white">
          <h3 className="text-xl font-bold">Pending Balance</h3>
          <p className="text-xl font-semibold ">₹ {formatNumber(tripBalance)}</p>
        </div>
        <Profit charges={charges} truckCost={trip.truckHireCost && trip.truckHireCost} amount={trip.amount} setCharges={setCharges} tripId={trip.trip_id} driverId={trip.driver} truckNo={trip.truck} />
        <EWayBillUpload validity={trip.ewbValidityDate ? trip.ewbValidityDate : null} tripId={trip.trip_id} ewayBillUrl={trip.documents?.find(doc=>doc.type == 'ewayBill')?.url || trip.ewayBill} setEwayBillUrl={setEwayBillUrl} />
        {trip.POD ? <PODViewer podUrl={trip.POD} /> : null}
      </div>
    </div>
  );
};

export default TripDetails;
