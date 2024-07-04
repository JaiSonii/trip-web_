import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface TruckHeaderProps {
  truck: string;
  driver: string;
}

const TruckHeader: React.FC<TruckHeaderProps> = ({ truck, driver }) => {
  const [truckName, setTruckName] = useState(truck);
  const [driverName, setDriverName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const response = await fetch(`/api/drivers/${driver}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch driver');
        }

        const result = await response.json();
        setDriverName(result.name);
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverDetails();
  }, [driver]);

  return (
    <div className="flex justify-between items-center p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg text-white">
      <div className="flex items-center w-1/2">
        <div className="bg-white p-4 rounded-full text-indigo-500">
          🚛
        </div>
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{truckName}</h1>
          <p className="text-sm">
            <Link href={`/trucks/${truck}`} className="underline hover:text-indigo-300 transition-colors duration-200">
              View Truck
            </Link>
          </p>
        </div>
      </div>
      <div className="w-1/2 text-right">
        {isLoading ? (
          <p className="text-sm">Loading...</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{driverName}</h1>
            <p className="text-sm">
              <Link href={`/drivers/${driver}`} className="underline hover:text-indigo-300 transition-colors duration-200">
                View Driver
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TruckHeader;
