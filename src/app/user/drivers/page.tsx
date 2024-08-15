// DriversPage.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IDriver } from '@/utils/interface';
import Loading from './loading';
import DriverBalance from '@/components/driver/DriverBalance';
import { FaUser, FaPhone, FaCircle } from 'react-icons/fa';

const DriversPage = () => {
  const router = useRouter();
  const [drivers, setDrivers] = useState<IDriver[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/drivers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch drivers');
        }

        const data = await res.json();
        setDrivers(data.drivers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Handling different states
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

  if (!drivers || drivers.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">No drivers found</div>
      </div>
    );
  }

  const statusColors = {
    Available: 'text-green-500',
    'On Trip': 'text-red-500',
    on_leave: 'text-yellow-500',
    suspended: 'text-gray-500',
  };

  return (
    <div className="w-full h-full p-4">
      <div className="table-container overflow-auto bg-white shadow rounded-lg">
        <table className="custom-table w-full border-collapse table-auto">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border p-4 text-left">Name</th>
              <th className="border p-4 text-left">Contact Number</th>
              <th className="border p-4 text-left">Status</th>
              <th className="border p-4 text-left">Balance (in Rupees)</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, index) => (
              <tr
                key={index}
                className="border-t hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => router.push(`/user/drivers/${driver.driver_id}`)}
              >
                <td className="border p-4 space-x-2">
                  <div className='flex items-center gap-3'>
                    <FaUser className="text-bottomNavBarColor" />
                    <span>{driver.name}</span>
                  </div>
                </td>
                <td className="border p-4 space-x-2 gap-3">
                  <div className='flex items-center'>
                    <FaPhone className="text-green-500" />
                    <span>{driver.contactNumber || ''}</span>
                  </div>
                </td>
                <td className="border p-4 flex items-center space-x-2">
                  <div className='flex items-center gap-3'>
                  <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        driver.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {driver.status}
                    </span>
                  </div>

                </td>
                <td className="border p-4 space-x-2 font-semibold text-xl">
                  <DriverBalance driverId={driver.driver_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversPage;
