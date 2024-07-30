'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PartyLayout from '@/components/layout/PartyLayout';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const {singleparty} = useParams();

  if (!singleparty) {
    return <div>Loading...</div>;
  }

  return (
    <PartyLayout partyId={singleparty as string}>
      {children}
    </PartyLayout>
  );
};

export default Layout;
