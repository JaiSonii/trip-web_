'use client'
import React, { useCallback, useMemo, useState } from 'react';
import Loading from './loading';
import { useRouter } from 'next/navigation';
import { truckTypesIcons } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExpenseCtx } from '@/context/context';
import { statuses } from '@/utils/schema';
import { FaRoute, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa6';
import { GoOrganization } from 'react-icons/go';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import debounce from 'lodash.debounce';

const TrucksPage = () => {
  const router = useRouter();

  const { trucks, isLoading } = useExpenseCtx()
  console.log(trucks)
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')

  const sortedTrucks = useMemo(() => {
    if (!trucks || trucks.length === 0) return [];  // This line ensures that trips is not null or empty
    let filteredTrips = [...trucks]

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      filteredTrips = trucks.filter((truck) =>
        truck.truckNo.toLowerCase().includes(lowercaseQuery) ||
        truck.latestTrip.partyName?.toLowerCase().includes(lowercaseQuery) ||
        truck.latestTrip.route?.origin.toLowerCase().includes(lowercaseQuery) ||
        truck.latestTrip.route?.destination.toLowerCase().includes(lowercaseQuery) ||
        new Date(truck.latestTrip?.startDate).toLocaleDateString().includes(lowercaseQuery) ||
        truck.status.toLowerCase().includes(lowercaseQuery) ||
        truck.truckType.toLowerCase().includes(lowercaseQuery) ||
        truck.supplierName?.toLowerCase().includes(lowercaseQuery) ||
        truck.driverName?.toLowerCase().includes(lowercaseQuery)
      )
    }
    if (sortConfig.key !== null) {
      filteredTrips.sort((a, b) => {
        if (a[sortConfig.key as any] < b[sortConfig.key as any]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as any] > b[sortConfig.key as any]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredTrips;
  }, [trucks, sortConfig, searchQuery]);


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


  if (isLoading) {
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
      <div className="">
        <div className='flex w-full px-60 mb-4'>
          <input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
          />
        </div>
        <Table className="">
          <TableHeader>
            <TableRow className="">
              <TableHead className="">Truck Number</TableHead>
              <TableHead className="" onClick={() => requestSort('truckType')}>
                <div className='flex justify-between'>
                  Truck Type {getSortIcon('truckType')}
                </div>
              </TableHead>
              <TableHead className="" onClick={() => requestSort('ownership')}>
                <div className='flex justify-between'>
                  OwnerShip {getSortIcon('ownership')}
                </div>
              </TableHead>
              <TableHead className="" onClick={() => requestSort('status')}>
                <div className='flex justify-between'>
                  Status {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead className="" onClick={() => requestSort('supplierName')}>
                <div className='flex justify-between'>
                  Supplier Name {getSortIcon('supplierName')}
                </div></TableHead>
              <TableHead className="">Latest Trip</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrucks.map((truck, index) => {
              const Icon = truckTypesIcons.find(item => item.type === truck.truckType)?.Icon;
              return (
                <TableRow
                  key={index}
                  className="border-t hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => router.push(`/user/trucks/${truck.truckNo}`)}
                >
                  <TableCell className=" text-gray-800 font-medium">
                    <div className='flex flex-col space-y-2'>
                      {truck.truckNo}
                      {truck.driverName && <span className='text-gray-400 text-sm'>Driver : <Button variant={'link'}><Link href={`/user/drivers/${truck.driver_id}`} onClick={(e) => e.stopPropagation()}>{truck.driverName}</Link></Button></span>}
                    </div>
                  </TableCell>
                  <TableCell className=" ">
                    <div className='flex items-center space-x-2 justify-between'>
                      <span>{truck.truckType}</span>
                      {Icon && <Icon className="inline-block ml-2 h-6 w-6 text-bottomNavBarColor" />}
                    </div>
                  </TableCell>
                  <TableCell className=" text-gray-700">{truck.ownership}</TableCell>
                  <TableCell className="">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${truck.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {truck.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {truck.supplierName ?
                      <Link href={`/user/suppliers/${truck.supplier}`} className='z-10' onClick={(e) => e.stopPropagation()}>
                        <Button variant={'link'}>
                          {truck.supplierName}
                        </Button>
                      </Link>
                      : 'NA'}

                  </TableCell>
                  <TableCell>
                    {truck.latestTrip && Object.keys(truck.latestTrip).length > 0 ? (
                      <Link href={`/user/trips/${truck.latestTrip.trip_id}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 p-2 bg-white rounded-lg border-none">
                          {/* Route and Party Info */}
                          <div className="flex flex-col justify-center space-y-1 pr-4">
                            <div className="flex items-center space-x-2">
                              <FaRoute className="text-bottomNavBarColor text-base" />
                              <span className="font-semibold text-sm text-gray-800">
                                {truck.latestTrip.route?.origin.split(',')[0]} &rarr; {truck.latestTrip.route?.destination.split(',')[0]}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <GoOrganization className="text-bottomNavBarColor text-base" />
                              <span className="text-xs text-gray-600">
                                {truck.latestTrip.partyName || 'NA'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {new Date(truck.latestTrip.startDate).toLocaleDateString('en-US', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Status Info */}
                          <div className="flex flex-col justify-between items-start flex-grow pl-4">
                            <span className="font-semibold text-sm text-gray-600">
                              {statuses[truck.latestTrip.status as number]}
                            </span>
                            <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mt-1">
                              <div
                                className={`h-full transition-width duration-500 rounded ${truck.latestTrip.status === 0
                                  ? 'bg-red-500'
                                  : truck.latestTrip.status === 1
                                    ? 'bg-yellow-500'
                                    : truck.latestTrip.status === 2
                                      ? 'bg-blue-500'
                                      : truck.latestTrip.status === 3
                                        ? 'bg-green-500'
                                        : 'bg-green-800'
                                  }`}
                                style={{ width: `${(truck.latestTrip.status + 1) * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      'NA'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TrucksPage;
