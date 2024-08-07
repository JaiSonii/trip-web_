'use client'
import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import Link from 'next/link';
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });



const TripsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  return (
    <div className={`${inter.className} bg-gray-100 min-h-screen flex flex-col`}>
      <div className="container mx-auto p-4 flex flex-col bg-white shadow-md rounded-md">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h1 className="text-3xl font-bold">Trips</h1>
          <div className="flex space-x-4">
            {!pathname.includes('create') &&
              <Button variant="newyork">
                <Link href="/user/trips/create">
                  Add Trip
                </Link>
              </Button>
            }

          </div>
        </div>
        <div className="flex-grow ">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TripsLayout;
