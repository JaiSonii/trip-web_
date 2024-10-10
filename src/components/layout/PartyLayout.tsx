// components/parties/PartyLayout.tsx
'use client'
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import PartyName from '../party/PartyName';

interface PartyLayoutProps {
  children: React.ReactNode;
  partyId: string;
}

const PartyLayout = ({ children, partyId }: PartyLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();



  const tabs = [
    { name: 'Trips', path: `/user/parties/${partyId}/trips` },
    { name: 'Passbook', path: `/user/parties/${partyId}/passbook` },
    { name: 'Monthly Balances', path: `/user/parties/${partyId}/monthly-balances` },
    { name: 'Party Details', path: `/user/parties/${partyId}/details` },
  ];

  return (
    <div className="min-h-screen bg-gray-100 rounded-md">
      <div className="w-full h-full p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-black"><PartyName partyId={partyId} /></h1>
        </header>
        <nav className="flex mb-6 border-b-2 border-gray-200">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.path}
              className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-lightOrangeButtonColor ${pathname === tab.path
                ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange'
                : 'border-transparent text-buttonTextColor hover:bottomNavBarColor hover:border-bottomNavBarColor'
                }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
        <main className="bg-white shadow-md rounded-lg p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PartyLayout;
