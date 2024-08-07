'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IDriver } from '@/utils/interface';
import DriverLayout from '@/components/driver/driverLayout';
import Loading from './loading';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const {driverId} = useParams();
  const [driver, setDriver] = useState<IDriver>();
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>()
  const router = useRouter()

  if (!driverId) {
    return <Loading />
  }

  const fetchDriverDetails = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver');
      }

      const result = await response.json();
      setDriver(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(driverId){
        fetchDriverDetails()
    }
  })

  if(loading) return <Loading />

  return (
    <DriverLayout name={driver?.name || '' } status={driver?.status || ''} driverId={driver?.driver_id || ''} onDriverUpdate={() => router.refresh()} contactNumber={driver?.contactNumber || ''}>
      {children}
    </DriverLayout>
  );
};

export default Layout;
