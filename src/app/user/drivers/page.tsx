// DriversPage.tsx
'use client'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IDriver } from '@/utils/interface';
import Loading from './loading';
import DriverBalance from '@/components/driver/DriverBalance';
import { FaUser, FaPhone, FaCircle, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/utils/utilArray';
import { useExpenseCtx } from '@/context/context';
import debounce from 'lodash.debounce';

const DriversPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
  const { drivers, isLoading } = useExpenseCtx()
  const [searchQuery, setSearchQuery] = useState('')

  const sortedDrivers = useMemo(() => {
    if (!drivers || drivers.length === 0) return []; // This line ensures that trips is not null or empty
    let sortableDrivers = [...drivers as any];

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      sortableDrivers = drivers.filter((driver) =>
        driver.name.toLowerCase().includes(lowercaseQuery) ||
        driver.contactNumber?.toLowerCase().includes(lowercaseQuery) ||
        driver.balance?.toString().toLowerCase().includes(lowercaseQuery) ||
        driver.status.toLowerCase().includes(lowercaseQuery)
      )
    }
    if (sortConfig.key !== null) {
      sortableDrivers.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDrivers;
  }, [drivers, sortConfig, searchQuery]);


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

  // Debounce the search input to reduce re-renders on each keystroke
  const debouncedSearch = useCallback(
    debounce((query) => setSearchQuery(query), 300),
    []
  );

  // Handle search input
  const handleSearch: any = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value.toLowerCase());
  };


  // Handling different states
  if (isLoading) {
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
      <div className='flex w-full px-60 mb-4'>
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
        />
      </div>
      <div className="">
        <Table className="">
          <TableHeader>
            <TableRow >
              <TableHead onClick={() => requestSort('name')}>
                <div className='flex justify-between'>
                  Name {getSortIcon('name')}
                </div>

              </TableHead>
              <TableHead >Contact Number</TableHead>
              <TableHead onClick={() => requestSort('status')}>
                <div className='flex justify-between'>
                  Status {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead onClick={() => requestSort('balance')}>
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
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${driver.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
