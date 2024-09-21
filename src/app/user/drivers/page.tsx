// DriversPage.tsx
'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IDriver } from '@/utils/interface';
import Loading from './loading';
import DriverBalance from '@/components/driver/DriverBalance';
import { FaUser, FaPhone, FaCircle, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/utils/utilArray';

const DriversPage = () => {
  const router = useRouter();
  const [drivers, setDrivers] = useState<IDriver[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })

  const sortedDrivers = useMemo(() => {
    if (!drivers || drivers.length === 0) return []; // This line ensures that trips is not null or empty
    let sortableTrips = [...drivers as any];
    if (sortConfig.key !== null) {
      sortableTrips.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTrips;
  }, [drivers, sortConfig]);


  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: any) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  }

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


  return (
    <div className="w-full h-full p-4">
      <div className="table-container overflow-auto bg-white shadow rounded-lg">
        <Table className="custom-table w-full border-collapse table-auto">
          <TableHeader>
            <TableRow >
              <TableHead onClick={()=>requestSort('name')}>
                <div className='flex justify-between'>
                Name {getSortIcon('name')}
                </div>
                
                </TableHead>
              <TableHead >Contact Number</TableHead>
              <TableHead >Status</TableHead>
              <TableHead onClick={()=>requestSort('balance')}>
              <div className='flex justify-between'>
                Balance {getSortIcon('balance')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDrivers.map((driver, index) => (
              <TableRow
                key={index}
                className="border-t hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => router.push(`/user/drivers/${driver.driver_id}`)}
              >
                <TableCell className="border p-4 space-x-2">
                  <div className='flex items-center gap-3'>
                    <FaUser className="text-bottomNavBarColor" />
                    <span>{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell className="border p-4 space-x-2 gap-3">
                  <div className='flex items-center space-x-2'>
                    <FaPhone className="text-green-500" />
                    <span>{driver.contactNumber || ''}</span>
                  </div>
                </TableCell>
                <TableCell className="border p-4 flex items-center space-x-2">
                  <div className='flex items-center gap-3'>
                  <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        driver.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {driver.status}
                    </span>
                  </div>

                </TableCell>
                <TableCell className="border p-4 space-x-2 font-semibold text-xl">
                  <span className={`${driver.balance as number < 0 ? 'text-red-500' : 'text-green-500'} font-semibold`}>₹{formatNumber(driver.balance as number)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DriversPage;
