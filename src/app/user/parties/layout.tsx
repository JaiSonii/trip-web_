'use client'
import { useState, useEffect } from 'react';
import { Inter } from "next/font/google";
import Link from 'next/link';
import '@/app/globals.css';
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Notification Component


const PartiesLayout = ({ children }: { children: React.ReactNode }) => {

  const headings: any = {
    '/user/parties': 'Customers',
    '/user/parties/create': 'New Customer',
  };

  const pathname = usePathname();

  // Handle closing the notification
 

  // Effect to show notification on load


  return (
    <div className={`${inter.className} bg-gray-100 min-h-screen flex flex-col`}>
      <div className="container mx-auto p-4 flex flex-col bg-white shadow-md rounded-md">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h1 className="text-3xl font-bold text-bottomNavBarColor">{headings[pathname] || 'Customers'}</h1>
          <div className="flex space-x-4">
            {!pathname.includes('create') &&
              <Button>
                <Link href="/user/parties/create">
                  Add Customer
                </Link>
              </Button>
            }
            <Button>
              <Link href="/user/trips/create">
                Add Trip
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex-grow">
          {children}
        </div>
      </div>

     
    </div>
  );
};

export default PartiesLayout;
