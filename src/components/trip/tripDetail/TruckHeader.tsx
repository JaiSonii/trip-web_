import React, { useEffect, useState } from 'react';
import { RiSteering2Fill } from "react-icons/ri";
import Link from 'next/link';
import { fetchDriverName } from '@/helpers/driverOperations';
import DriverName from '@/components/driver/DriverName';

interface TruckHeaderProps {
  truck: string;
  driver: string;
}

const TruckHeader: React.FC<TruckHeaderProps> = ({ truck, driver }) => {
  const [truckName, setTruckName] = useState(truck);

  return (
    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-500 via-bottomNavBarColor to-bottomNavBarColor rounded-lg shadow-lg text-white">
      <div className="flex items-center">
        <div className="bg-white p-2 rounded-full text-gray-800 shadow-md">
          <span className="text-4xl">🚛</span>
        </div>
        <div className="ml-4">
          <h1 className="text-2xl font-bold cursor-pointer transition duration-300 ease-in-out hover:text-gray-300 hover:scale-105">
            <Link href={`/user/trucks/${truck}`}>
              <span>{truckName}</span>
            </Link>
          </h1>
        </div>
      </div>
      <div className="flex items-center">
        <RiSteering2Fill className="text-4xl text-white mr-2 transition duration-300 ease-in-out hover:text-gray-300 hover:scale-105 cursor-pointer" />
        <div className="text-right">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold cursor-pointer transition duration-300 ease-in-out hover:text-gray-300 hover:scale-105">
                 <Link href={`/user/drivers/${driver}`}>
                  <span><DriverName driverId={driver}/></span>
                </Link>
                
              </h1>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TruckHeader;
