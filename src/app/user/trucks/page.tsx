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
import TripCard from '@/components/TripCard';

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
                      <TripCard
                        key={truck.latestTrip.trip_id}
                        tripId={truck.latestTrip.trip_id}
                        route={truck.latestTrip.route}
                        partyName={truck.latestTrip.partyName}
                        status={truck.latestTrip.status}
                        statuses={statuses}
                      />
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
