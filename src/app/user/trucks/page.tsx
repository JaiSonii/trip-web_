'use client'
import React, { useState } from 'react';
import Loading from './loading';
import { useRouter } from 'next/navigation';
import { truckTypesIcons } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExpenseCtx } from '@/context/context';

const TrucksPage = () => {
  const router = useRouter();

  const {trucks, isLoading} = useExpenseCtx()
  const [error, setError] = useState<string | null>(null);


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
        <Table className="">
          <TableHeader>
            <TableRow className="">
              <TableHead className="">Truck Number</TableHead>
              <TableHead className="">Truck Type</TableHead>
              <TableHead className="">Ownership</TableHead>
              <TableHead className="">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucks.map((truck, index) => {
              const Icon = truckTypesIcons.find(item => item.type === truck.truckType)?.Icon;
              return (
                <TableRow
                  key={index}
                  className="border-t hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => router.push(`/user/trucks/${truck.truckNo}`)}
                >
                  <TableCell className=" text-gray-800 font-medium">{truck.truckNo}</TableCell>
                  <TableCell className=" ">
                  <div className='flex items-center space-x-2 justify-between'>
                    <span>{truck.truckType}</span>
                    {Icon && <Icon className="inline-block ml-2 h-6 w-6 text-bottomNavBarColor" />}
                    </div>
                  </TableCell>
                  <TableCell className=" text-gray-700">{truck.ownership}</TableCell>
                  <TableCell className="">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        truck.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {truck.status}
                    </span>
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
