'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';
import { FaUser, FaPhone, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';

import { IDriver } from '@/utils/interface';
import { formatNumber } from '@/utils/utilArray';
import { useExpenseCtx } from '@/context/context';
import Loading from './loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useSWRConfig } from 'swr';

type SortConfig = {
  key: keyof IDriver | null;
  direction: 'asc' | 'desc';
};

export default function DriversPage() {
  
  const router = useRouter();
  const { drivers, isLoading } = useExpenseCtx();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

  const {mutate} = useSWRConfig()

  useEffect(()=>{
    mutate('/api/drivers')
  },[mutate])

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value.toLowerCase());
  }, [debouncedSearch]);

  const sortedDrivers = useMemo(() => {
    if (!drivers || drivers.length === 0) return [];
    
    let sortableDrivers = [...drivers];

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      sortableDrivers = sortableDrivers.filter((driver) =>
        Object.values(driver).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
        )
      );
    }

    if (sortConfig.key) {
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

  const requestSort = useCallback((key: keyof IDriver) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const getSortIcon = useCallback((columnName: keyof IDriver) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  }, [sortConfig]);

  if (isLoading) return <Loading />;

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
        <Input
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
          className="w-full"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
              <div className='flex justify-between items-center'>
                Name {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead onClick={() => requestSort('status')} className="cursor-pointer">
              <div className='flex justify-between items-center'>
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort('balance')} className="cursor-pointer">
              <div className='flex justify-between items-center'>
                Balance {getSortIcon('balance')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDrivers.map((driver) => (
            <TableRow
              key={driver.driver_id}
              className="border-t hover:bg-blue-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/user/drivers/${driver.driver_id}`)}
            >
              <TableCell className="border p-4">
                <div className='flex items-center gap-3'>
                  <FaUser className="text-bottomNavBarColor" />
                  <span>{driver.name}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <div className='flex items-center gap-3'>
                  <FaPhone className="text-green-500" />
                  <span>{driver.contactNumber || ''}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    driver.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {driver.status}
                </span>
              </TableCell>
              <TableCell className="border p-4 font-semibold text-xl">
                <span className={`${Number(driver.balance) < 0 ? 'text-red-500' : 'text-green-500'} font-semibold`}>
                  ₹{formatNumber(Number(driver.balance))}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}