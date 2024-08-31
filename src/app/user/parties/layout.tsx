'use client'
import { useState, useEffect } from 'react';
import { Inter } from "next/font/google";
import Link from 'next/link';
import '@/app/globals.css';
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Notification Component
const Notification = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <div className="fixed top-5 right-5 bg-lightOrange border-l-4 border-yellow-500 text-buttonTextColor p-4 rounded shadow-lg">
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-buttonTextColor transform duration-300 ease-in-out hover:scale-125">X</button>
      </div>
    </div>
  );
};

const PartiesLayout = ({ children }: { children: React.ReactNode }) => {
  const [showNotification, setShowNotification] = useState(true); // State for controlling notification visibility

  const headings: any = {
    '/user/parties': 'Parties',
    '/user/parties/create': 'New Party',
  };

  const pathname = usePathname();

  // Handle closing the notification
  const closeNotification = () => {
    setShowNotification(false);
  };

  // Effect to show notification on load
  useEffect(() => {
    setShowNotification(true);
  }, []);

  return (
    <div className={`${inter.className} bg-gray-100 min-h-screen flex flex-col`}>
      <div className="container mx-auto p-4 flex flex-col bg-white shadow-md rounded-md">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h1 className="text-3xl font-bold text-bottomNavBarColor">{headings[pathname] || 'Parties'}</h1>
          <div className="flex space-x-4">
            {!pathname.includes('create') &&
              <Button>
                <Link href="/user/parties/create">
                  Add Party
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

      {/* Notification */}
      {showNotification && (
        <Notification 
          message="Don't forget to add a phone number for each party!" 
          onClose={closeNotification} 
        />
      )}
    </div>
  );
};

export default PartiesLayout;
