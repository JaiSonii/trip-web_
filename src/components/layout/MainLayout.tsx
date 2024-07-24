'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaTruckMoving, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firbaseConfig'; // Adjust the path as needed
import { FaTruckFast } from "react-icons/fa6";

const MainLayout = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    // Set the initial selected menu item based on the current pathname
    const initialSelected = menuItems.find(item => pathname.startsWith(item.href));
    if (initialSelected) {
      setSelected(initialSelected.label);
    }
  }, [pathname]);

  const menuItems = [
    { href: `/user/parties`, label: 'Parties' },
    { href: `/user/trips`, label: 'Trips' },
    { href: `/user/drivers`, label: 'Drivers' },
    { href: `/user/trucks`, label: 'Trucks' },
    { href: `/user/suppliers`, label: 'Suppliers'},
    { href: `/user/expenses`, label: 'Expenses'}
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear the auth token cookie
      document.cookie = 'auth_token=; Max-Age=0; path=/;';
      // Redirect to the login page
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div>
      <div className="md:hidden flex justify-between items-center p-4 bg-gray-800 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <FaTruckMoving />
          <span className="ml-3 text-2xl font-bold">Mo Verse Demo Project</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`h-screen w-1/6 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600 text-white fixed top-0 left-0 md:flex flex-col shadow-lg transition-transform duration-300 ease-in-out ${isMenuOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} md:translate-x-0 z-40`}>
        <div className="flex items-center justify-center p-4 md:justify-start md:pl-4 border">
          <FaTruckFast style={{width : '80px', height : '80px'}}/>
          <span className="ml-3 text-2xl font-bold">Mo Verse Demo Project</span>
        </div>
        <ul className="list-none p-0 m-0">
          {menuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href}>
                <div 
                  className={`flex items-center p-4 text-lg font-semibold transition duration-300 ease-in-out rounded-md ${pathname.startsWith(item.href) || selected === item.label ? 'bg-gray-600 text-gray-300' : 'hover:bg-gray-700 hover:text-gray-300'}`}
                  onClick={() => setSelected(item.label)}
                >
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
          <li>
            <div
              className={`flex items-center gap-2 p-4 text-lg font-semibold transition duration-300 ease-in-out rounded-md hover:bg-gray-700 hover:text-gray-300 cursor-pointer`}
              onClick={handleSignOut}
            >
              <p>SignOut</p>
              <FaSignOutAlt />
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MainLayout;
