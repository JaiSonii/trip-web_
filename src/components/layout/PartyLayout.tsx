// components/parties/PartyLayout.tsx
'use client'
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../AuthProvider';
import Link from 'next/link';
import PartyName from '../party/PartyName';

interface PartyLayoutProps {
  children: React.ReactNode;
  partyId: string;
}

const PartyLayout = ({ children, partyId }: PartyLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }// Log the user's Firebase ID token for debugging purposes. This is not necessary for the functionality of the app.
  }, [loading, user, router])

  const tabs = [
    { name: 'Trips', path: `/user/parties/${partyId}/trips` },
    { name: 'Passbook', path: `/user/parties/${partyId}/passbook` },
    { name: 'Monthly Balances', path: `/user/parties/${partyId}/monthly-balances` },
    { name: 'Party Details', path: `/user/parties/${partyId}/details` },
  ];


  return (
    <div>
      {user ?
        <div className="w-full h-full p-4">
          <h1 className="text-2xl font-bold mb-4"><PartyName partyId={partyId}/></h1>
          <div className="flex space-x-4 mb-4 border-b-2 border-gray-200">
            {tabs.map((tab) => (
              <div className='flex p-1' key={tab.name}>
                <Link
                  key={tab.name}
                  href={tab.path}
                  className={`px-4 py-2 transition duration-300 ease-in-out ${pathname === tab.path
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500'
                    }`}
                >
                  {tab.name}
                </Link>
              </div>

            ))}
          </div>
          <div className="mt-4">
            {children}
          </div>
        </div> : null
      }
    </div>


  );
};

export default PartyLayout;
