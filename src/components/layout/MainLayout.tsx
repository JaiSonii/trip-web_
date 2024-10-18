'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { IoDocumentsOutline, IoLogOutOutline, IoWalletOutline } from 'react-icons/io5';
import Cookies from 'js-cookie';
import Image from 'next/image';
import logo from '@/assets/awajahi logo.png';
import jwt from 'jsonwebtoken';
import { TfiHome, TfiWorld } from "react-icons/tfi";
import { PiSteeringWheelLight, PiTruck, PiBank } from "react-icons/pi";
import { TbUsersGroup } from "react-icons/tb";
import { HiOutlineUser } from "react-icons/hi";
import { ExpenseProvider } from '@/context/context';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { tripId } = useParams()
  const pathname = usePathname();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>('');
  const [user, setUser] = useState<any>(null);

  // useEffect(() => {
  //   const fetchPhone = async () => {
  //     const response = await fetch('/api/login');
  //     const data = await response.json();
  //     setUser(data.user);
  //     setPhone(data.user.phone);
  //   };
  //   fetchPhone();
  // }, []);

  useEffect(() => {
    const initialSelected = primaryMenuItems.find(item => pathname.startsWith(item.href));
    if (initialSelected) {
      setSelected(initialSelected.label);
    }
  }, [pathname]);

  const roleToken = Cookies.get('role_token');
  const decodedToken: any = jwt.decode(roleToken as string);

  const primaryMenuItems = [
    { href: '/user/home', label: 'Home', icon: TfiHome },
    { href: '/user/trips', label: 'Trips', icon: TfiWorld },
    { href: `/user/expenses`, label: 'Expenses', icon: IoWalletOutline },
    { href: '/user/documents', label: 'Docs', icon: IoDocumentsOutline },
  ];

  const secondaryMenuItems = [
    { href: '/user/drivers', label: 'Drivers', icon: PiSteeringWheelLight },
    { href: '/user/trucks', label: 'Lorries', icon: PiTruck },
    { href: '/user/parties', label: 'Customers', icon: TbUsersGroup },
    { href: '/user/suppliers', label: 'Suppliers', icon: HiOutlineUser },
    { href: '/user/shopkhata', label: 'Shop Khata', icon: PiBank },
  ];

  const handleSignOut = async () => {
    try {
      await fetch(`/api/logout`);
      Cookies.remove('auth_token');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFCF9]">
      {/* Primary Sidebar - fixed width, fixed position */}
      <div className="w-20 bg-bottomNavBarColor text-white h-full flex flex-col justify-between shadow-md shadow-black rounded-r-xl fixed">
        <div>
          {/* Primary Menu */}
          <ul className="list-none p-0 m-0 flex flex-col gap-4 py-6">
            {primaryMenuItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link href={item.href}>
                  <div
                    className={`flex flex-col space-y-2 items-center p-4 text-lg font-semibold transition duration-300 ease-in-out rounded-md 
                      ${pathname === (item.href) ? 'bg-white text-black' : 'hover:bg-lightOrange'}`}
                    onClick={() => setSelected(item.label)}
                  >
                    <item.icon className="mx-auto" size={28} />
                    <span className='text-sm text-center font-normal'>{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign Out */}
        <div className="py-4 cursor-pointer flex flex-col space-y-2 items-center justify-center hover:bg-lightOrange" onClick={handleSignOut}>
          <IoLogOutOutline size={28} />
          <span className='text-sm text-white text-center font-normal'>Log Out</span>
        </div>
      </div>

      {/* Secondary Sidebar */}
      <div className="ml-20 w-60 bg-[#FFFCF9] text-black h-screen overflow-y-auto flex flex-col justify-between"> {/* Adjusted width and overflow */}
        <div className="flex items-center justify-center py-6">
          <Image src={logo} alt="logo" width={51} height={60} priority />
          <span className="ml-2 text-lg hidden font-semibold md:block text-black">Awajahi</span>
        </div>
        <ul className="flex-grow list-none p-0 m-0 flex-col gap-4">
          {secondaryMenuItems.map((item) => (
            <li key={item.href} className="my-1 border-b-2 border-gray-300">
              <div
                className={`p-2 `}
              >
                <Link href={item.href}>
                  <div
                    className={`flex items-center p-3 text-lg font-semibold transition duration-300 ease-in-out rounded-xl
                    ${pathname === (item.href) ? 'bg-[#FF6A00] text-white' : 'hover:bg-[#FFC49980]'}`}
                    onClick={() => setSelected(item.label)}
                  >
                    <item.icon className="mr-3" size={25} />
                    <span className=' font-semibold text-lg'>{item.label}</span>
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className={`w-full min-h-screen overflow-y-auto pb-4 rounded-3xl bg-white shadow-black shadow-xl my-2 ${pathname.startsWith('/user/trips/trip') ? 'thin-scrollbar' : 'no-scrollbar'} `}>

        {/* Render dynamic content here */}
        <ExpenseProvider>
          {children}
        </ExpenseProvider>
      </div>
    </div>
  );
};

export default MainLayout;
