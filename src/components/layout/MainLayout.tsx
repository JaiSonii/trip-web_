'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaTruckMoving, FaSignOutAlt, FaBars, FaTimes, FaUserCircle, FaHome, FaTruck, FaUsers, FaClipboardList, FaFileInvoiceDollar, FaUser, FaCheckCircle } from "react-icons/fa";
import Cookies from 'js-cookie';
import { FaTruckFast, FaCircle, FaShop } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { RiSteering2Fill, RiTruckLine } from "react-icons/ri";
import { auth } from '@/firebase/firbaseConfig';
import { Button } from '../ui/button';
import { signOut } from 'firebase/auth';
import { MdArrowDropDown } from "react-icons/md";
import { motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import whiteLogo from '@/assets/awajahi-white-logo.png'
import Image from 'next/image';
import jwt from 'jsonwebtoken'
import { IoDocument } from 'react-icons/io5';



const MainLayout = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState<any>();
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [phone, setPhone] = useState<string | null>('');
  const [user, setUser] = useState<any>();
  const [isSwitchBoxOpen, setIsSwitchBoxOpen] = useState(false);

  useEffect(() => {
    const fetchPhone = async () => {
      const response = await fetch('/api/login');
      const data = await response.json();
      setUser(data.user);
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

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const selectedRole = getCookie('selectedRole');
  const roleToken = Cookies.get('role_token')
  const decodedToken: any = jwt.decode(roleToken as string)

  const menuItems = decodedToken?.role.name == 'driver' ? [{
    href: `/user/drivers/${decodedToken.role.driver_id}`, label: `Driver`, icon: RiSteering2Fill
  }] : [
    { href: `/user/parties`, label: 'Customers', icon: FaUsers },
    { href: `/user/trips`, label: 'Trips', icon: FaClipboardList },
    { href: `/user/drivers`, label: 'Drivers', icon: RiSteering2Fill },
    { href: `/user/trucks`, label: 'Lorries', icon: FaTruck },
    { href: `/user/suppliers`, label: 'Suppliers', icon: FaUser },
    {
      href: `/user/expenses/truckExpense?monthYear=${encodeURIComponent(selectedMonthYear)}`,
      label: 'Expenses', icon: FaFileInvoiceDollar
    },
    { href: `/user/shopkhata`, label: 'Shop Khata', icon: FaShop },
    { href: `/user/search`, label: 'Search', icon: SearchIcon },
    { href : `/user/documents`, label : 'Documents', icon : IoDocument}
  ];

  const handleSignOut = async () => {
    try {
      await fetch(`/api/logout`)
      Cookies.remove('auth_token')
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };


  return (
    <div className="flex h-screen">
      <div className={`h-full w-1/6 bg-gradient-to-bl from-bottomNavBarColor via-bottomNavBarColor to-orange-500 text-white fixed top-0 left-0 md:flex flex-col shadow-lg transition-transform duration-300 ease-in-out ${isMenuOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} md:translate-x-0 z-40`}>

        {/* Logo and Title */}
        <div className="flex items-center justify-center p-4 md:justify-start md:pl-4 border-b border-borderColor">
          <Image src={whiteLogo} alt='logo' width={50} height={50} priority />
          <span className="ml-3 text-3xl font-bold">Awajahi</span>
        </div>

        {/* Menu Items */}
        <ul className="flex-grow list-none p-0 m-0 h-auto">
          {menuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href}>
                <div
                  className={`flex items-center p-4 text-lg font-semibold transition duration-300 ease-in-out rounded-md 
          ${pathname.startsWith(item.href) || selected === item.label ? 'bg-primaryOrange text-whiteColor' : 'hover:bg-lightOrange hover:text-whiteColor'}
          lg:p-3 lg:text-base md:p-2 md:text-sm sm:p-1 sm:text-xs`}
                  onClick={() => setSelected(item.label)}
                >
                  <item.icon className="mr-3" />
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>


        {/* User Profile and Switch Account */}
        <div className="flex flex-col items-center p-6 border-t border-borderColor">
          <div className='flex items-center space-x-2'>
            <FaRegUser style={{ width: '40px', height: '40px' }} />
            <div className="ml-3 text-center">
              <Button variant={'link'}>
                <Link href={{
                  pathname: `/user/profile/details`,
                  query: { phone, user_id: user?.user_id }
                }}>
                  <p className="text-lg font-semibold">{phone}</p>
                </Link>
              </Button>
            </div>




          </div>
          {/* <Button variant={'outline'} onClick={() => setIsSwitchBoxOpen(!isSwitchBoxOpen)} >
            <div className='flex items-center space-x-1'>
              <span className='text-white'>{selectedRole}</span>
              <MdArrowDropDown className='text-white' />
            </div>
          </Button> */}
        </div>
        {/* Switch Account Box */}
        {isSwitchBoxOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-4 bg-white text-black rounded-lg shadow-lg z-50"
          >
          </motion.div>
        )}

        {/* Sign Out Button */}
        <div className="flex items-center justify-center p-4 cursor-pointer hover:bg-lightOrange" onClick={()=>handleSignOut}>
          <FaSignOutAlt style={{ width: '24px', height: '24px' }} />
          <span className="ml-3 text-lg font-semibold">Sign Out</span>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
