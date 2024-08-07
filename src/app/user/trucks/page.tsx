'use client'
import React, { useEffect, useState } from 'react';
import { TruckModel } from '@/utils/interface';
import Loading from '@/app/user/loading';
import { useRouter } from 'next/navigation';
import { truckTypesIcons } from '@/utils/utilArray';

const TrucksPage = () => {
  const router = useRouter();

  const [trucks, setTrucks] = useState<TruckModel[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await fetch('/api/trucks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch trucks');
        }

        const data = await res.json();
        setTrucks(data.trucks);
      } catch (err) {
        setError((err as Error).message);
      } finally {
          setLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!trucks || trucks.length === 0) {
    return <div>No trucks found</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <table className="custom-table w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Truck Number</th>
              <th className="border p-2">Truck Type</th>
              <th className="border p-2">Ownership</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((truck, index) => {
              const Icon = truckTypesIcons.find(item => item.type === truck.truckType)?.Icon;
              return (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => router.push(`/user/trucks/${truck.truckNo}`)}
                >
                  <td className="border p-2 text-gray-800 font-medium">{truck.truckNo}</td>
                  <td className="border p-2 ">
                  <div className='flex items-center space-x-2 justify-between'>
                    <span>{truck.truckType}</span>
                    {Icon && <Icon className="inline-block ml-2 h-6 w-6 text-bottomNavBarColor" />}
                    </div>
                  </td>
                  <td className="border p-2 text-gray-700">{truck.ownership}</td>
                  <td className="border p-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        truck.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {truck.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrucksPage;
