'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loading from '../loading';
import TruckLayout from '@/components/layout/TruckLayout';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const {truckNo} = useParams();

  useEffect(() => {
    if (!truckNo) return;

    const fetchPartyName = async () => {
      try {
        const res = await fetch(`/api/trucks/${truckNo}`);
        if (!res.ok) {
          throw new Error('Failed to fetch party name');
        }
        const data = await res.json();
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchPartyName();
  }, [truckNo]);

  if (!truckNo) {
    return <Loading />
  }

  return (
    <TruckLayout truckNo={truckNo as string}>
      {children}
    </TruckLayout>
  );
};

export default Layout;
