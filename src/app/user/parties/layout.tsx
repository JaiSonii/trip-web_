'use client'
import { Inter } from "next/font/google";
import Link from 'next/link';
import '@/app/globals.css'
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const PartiesLayout = ({ children }: { children: React.ReactNode }) => {

  const headings: any = {
    '/user/parties': 'Parties',
    '/user/parties/create' : 'New Party'
  }

  const pathname = usePathname()
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

            <Button >
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
