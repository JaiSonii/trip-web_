'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaSignOutAlt, FaHome, FaClipboardList, FaFileInvoiceDollar, FaUsers, FaTruck, FaUser } from "react-icons/fa";
import { RiSteering2Fill } from "react-icons/ri";
import { FaShop } from "react-icons/fa6";
import { IoDocument, IoDocumentsOutline, IoLogOutOutline, IoWalletOutline } from 'react-icons/io5';
import Cookies from 'js-cookie';
import Image from 'next/image';
import logo from '@/assets/awajahi logo.png';
import jwt from 'jsonwebtoken';
import { TfiHome, TfiWorld } from "react-icons/tfi";
import { PiSteeringWheelLight,  PiTruck, PiBank } from "react-icons/pi";
import { TbUsersGroup } from "react-icons/tb";
import { HiOutlineUser } from "react-icons/hi";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchPhone = async () => {
      const response = await fetch('/api/login');
      const data = await response.json();
      setUser(data.user);
      setPhone(data.user.phone);
    };
    fetchPhone();
  }, []);

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
    { href: `/user/expenses/truckExpense`, label: 'Expenses', icon: IoWalletOutline },
    { href: '/user/documents', label: 'Docs', icon: IoDocumentsOutline },
  ];

  const secondaryMenuItems = [
    { href: '/user/drivers', label: 'Drivers', icon: PiSteeringWheelLight },
    { href: '/user/trucks', label: 'Lorries', icon: PiTruck },
    { href: '/user/parties', label: 'Parties', icon: TbUsersGroup },
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
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Primary Sidebar - fixed width, fixed position */}
      <div className="w-20 bg-bottomNavBarColor text-white h-full flex flex-col justify-between shadow-lg shadow-black rounded-r-xl fixed">
        <div>
          {/* Logo */}
          

          {/* Primary Menu */}
          <ul className="list-none p-0 m-0 flex flex-col gap-4 py-6">
            {primaryMenuItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link href={item.href}>
                  <div
                    className={`flex flex-col space-y-2 items-center p-4 text-lg font-semibold transition duration-300 ease-in-out rounded-md 
                      ${pathname.startsWith(item.href) || selected === item.label ? 'bg-white text-black' : 'hover:bg-lightOrange'}`}
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

      {/* Secondary Sidebar - double the width of primary, positioned beside it */}
      <div className="ml-20 w-48 bg-gray-100 text-black h-full flex flex-col justify-between ">
      <div className="flex items-center justify-center py-6">
            <Image src={logo} alt="logo" width={51} height={60} priority />
            <span className="ml-2 text-lg hidden font-semibold md:block">Awajahi</span>
          </div>
        <ul className="flex-grow list-none p-0 m-0 flex-col gap-4">
          {secondaryMenuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href}>
                <div
                  className={`flex items-center p-4 text-lg font-semibold transition duration-300 ease-in-out border-b-2 border-gray-300
                    ${pathname.startsWith(item.href) || selected === item.label ? 'bg-lightOrange text-white' : 'hover:bg-lightOrange'}`}
                  onClick={() => setSelected(item.label)}
                >
                  <item.icon className="mr-3" size={25}/>
                  <span className=' font-semibold text-lg'>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area - takes remaining width */}
      <div className=" flex-grow overflow-y-auto p-4 rounded-2xl">
        {/* Render dynamic content here */}
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
