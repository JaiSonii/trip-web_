'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaTruckMoving, FaSignOutAlt, FaBars, FaTimes, FaUserCircle, FaHome, FaTruck, FaUsers, FaClipboardList, FaFileInvoiceDollar, FaUser } from "react-icons/fa";
import { signOut } from 'firebase/auth';
import { FaTruckFast, FaCircle } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { RiSteering2Fill } from "react-icons/ri";
import { auth } from '@/firebase/firbaseConfig';

const MainLayout = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState<any>();
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [phone, setPhone] = useState<string | null>('');

  useEffect(() => {
    const fetchPhone = async () => {
      const response = await fetch('/api/login');
      const data = await response.json();
      setPhone(data.user.phone);
    };
    fetchPhone();
  }, [auth]);

  useEffect(() => {
    const initialSelected = menuItems.find(item => pathname.startsWith(item.href));
    if (initialSelected) {
      setSelected(initialSelected.label);
    }
  }, [pathname]);

  useEffect(() => {
    const currentDate = new Date();
    const currentMonthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    setSelectedMonthYear(currentMonthYear);
  }, []);

  const menuItems = [
    { href: `/user/parties`, label: 'Parties', icon: FaUsers },
    { href: `/user/trips`, label: 'Trips', icon: FaClipboardList },
    { href: `/user/drivers`, label: 'Drivers', icon: RiSteering2Fill },
    { href: `/user/trucks`, label: 'Trucks', icon: FaTruck },
    { href: `/user/suppliers`, label: 'Suppliers', icon: FaUser },
    {
      href: `/user/expenses/truckExpense?monthYear=${encodeURIComponent(selectedMonthYear)}`,
      label: 'Expenses', icon: FaFileInvoiceDollar
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      document.cookie = 'auth_token=; Max-Age=0; path=/;';
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div>
      <div className={`h-screen w-1/6 bg-gradient-to-bl from-bottomNavBarColor via-bottomNavBarColor to-lightOrange text-white fixed top-0 left-0 md:flex flex-col shadow-lg transition-transform duration-300 ease-in-out ${isMenuOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} md:translate-x-0 z-40`}>
        <div className="flex items-center justify-center p-4 md:justify-start md:pl-4 border-b border-borderColor">
          <FaTruckFast style={{ width: '50px', height: '50px' }} />
          <span className="ml-3 text-xl font-bold">MoVerse</span>
        </div>
        <ul className="flex-grow list-none p-0 m-0">
          {menuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href}>
                <div
                  className={`flex items-center p-4 text-lg font-semibold transition duration-300 ease-in-out rounded-md ${pathname.startsWith(item.href) || selected === item.label ? 'bg-primaryOrange text-whiteColor' : 'hover:bg-lightOrange hover:text-whiteColor'}`}
                  onClick={() => setSelected(item.label)}
                >
                  <item.icon className="mr-3" />
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-center p-4 border-t border-borderColor">
          <FaRegUser style={{ width: '40px', height: '40px' }} />
          <div className="ml-3">
            <p className="text-lg font-semibold">{phone}</p>
            <p className="text-sm"></p>
          </div>
        </div>
        <div className="flex items-center justify-center p-4 cursor-pointer hover:bg-lightOrange" onClick={handleSignOut}>
          <FaSignOutAlt style={{ width: '24px', height: '24px' }} />
          <span className="ml-3 text-lg font-semibold">Sign Out</span>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
