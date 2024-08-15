'use client'

import React, { useEffect, useState } from 'react';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import PartyName from '@/components/party/PartyName';
import { FaTruck, FaRoute, FaCalendarAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const TripsPage = () => {
  const router = useRouter();

  const [trips, setTrips] = useState<ITrip[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [totalBalance, setBalance] = useState(0)

  const fetchTrips = async (statuses: number[] = []) => {
    setLoading(true)
    setError(null);

    try {
      const queryParam = statuses.length > 0 ? `?statuses=${statuses.join(',')}` : '';
      const res = await fetch(`/api/trips${queryParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await res.json();
      setTrips(data.trips);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(selectedStatuses);
    
  }, [selectedStatuses]);

  useEffect(()=>{
    calculateBalance()
  },[trips])

  const handleStatusChange = (value: string) => {
    const status = parseInt(value);
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const calculateBalance = async ()=>{
    setBalance(0)
    trips?.forEach(async(trip) => {
      const balance = await fetchBalance(trip)
      setBalance((prev)=> prev + balance)
      
    });
    
  }



  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className='flex items-center justify-between '>
        <div className='flex items-center bg-lightOrange rounded-sm text-buttonTextColor p-2'>
          <span>Total Balance :</span>
          <span className="ml-2 text-lg font-bold">{totalBalance}</span>
        </div>
        <div className="flex justify-end mt-1">
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status, index) => (
              <SelectItem key={index} value={index.toString()}>
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(index)}
                  onChange={() => handleStatusChange(index.toString())}
                />
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      </div>
      

      {(!trips || trips.length === 0) ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">No trips found</div>
        </div>
      ) : (
        <div className="table-container overflow-auto bg-white shadow rounded-lg">
          <table className="custom-table w-full border-collapse table-auto">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="border p-4 text-left">Start Date</th>
                <th className="border p-4 text-left">LR Number</th>
                <th className="border p-4 text-left">Truck Number</th>
                <th className="border p-4 text-left">Party Name</th>
                <th className="border p-4 text-left">Route</th>
                <th className="border p-4 text-left">Status</th>
                <th className="border p-4 text-left">Party Balance</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, index) => (
                <tr
                  key={index}
                  className="
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  "
                  onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
                >
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-bottomNavBarColor" />
                      <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="border p-4">{trip.LR}</td>
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      <FaTruck className="text-bottomNavBarColor" />
                      <span>{trip.truck}</span>
                    </div>
                  </td>
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      <GoOrganization className="text-bottomNavBarColor" />
                      <span><PartyName partyId={trip.party} /></span>
                    </div>
                  </td>
                  <td className="border p-4">
                    <div className='flex items-center space-x-2'>
                      <FaRoute className="text-bottomNavBarColor" />
                      <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                    </div>
                  </td>
                  <td className="border p-4">
                    <div className="flex flex-col items-center space-x-2">
                      <span>{statuses[trip.status as number]}</span>
                      <div className="relative w-full bg-gray-200 h-1 rounded">
                        <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="border p-4">
                    <div className="flex items-center space-x-2">
                      <FaFileInvoiceDollar className="text-bottomNavBarColor" />
                      <span>{fetchBalance(trip)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
