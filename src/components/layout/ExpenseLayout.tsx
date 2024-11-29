'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaTruckMoving } from 'react-icons/fa';
import Link from 'next/link';
import { RiHomeOfficeFill } from 'react-icons/ri';
import { FaRoute, FaTruck } from 'react-icons/fa6';
import { RouteIcon } from 'lucide-react';
import { HiBuildingOffice } from 'react-icons/hi2';
import { LuSigma } from "react-icons/lu";
import { formatNumber } from '@/utils/utilArray';
import { GiExpense } from "react-icons/gi";


interface TruckLayoutProps {
  children: React.ReactNode;
}


const ExpenseLayout: React.FC<TruckLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [truckExpense, setTruckExpense] = useState(0);
  const [tripExpense, setTripExpense] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [officeExpense, setOfficeExpense] = useState(0)
  



  useEffect(() => {
    const fetchExpenses = async () => {
      router.push(`${pathname}`);
      const res = await fetch('/api/expenses/calculate')
      const data = await res.json()
      const { totalTruckExpense, totalTripExpense, totalOfficeExpense } = data.expenses;

      setTruckExpense(totalTruckExpense);
      setTripExpense(totalTripExpense);
      setOfficeExpense(totalOfficeExpense);

      const total = totalTripExpense + totalTruckExpense + totalOfficeExpense;
      setTotalExpense(total);

    };

    fetchExpenses();
  }, []);


  const tabs = [
    { logo: <GiExpense />, name: 'All Expenses', path: `/user/expenses` },
    { logo: <FaTruckMoving />, name: 'Truck Expenses', path: `/user/expenses/truckExpense` },
    { logo: <FaRoute />, name: 'Trip Expenses', path: `/user/expenses/tripExpense` },
    { logo: <RiHomeOfficeFill />, name: 'Office Expenses', path: `/user/expenses/officeExpense` }
  ];

  const financialYear = new Date().getMonth() + 1 < 4 ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}` : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;


  return (
    <div className="w-full h-full p-4 bg-gray-50">
      <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center mb-2">
        <div className="w-full flex justify-between">
          <h1 className="text-2xl font-bold mb-2 text-black">Expense Overview ({financialYear})</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <div className="flex flex-col items-center border text-black border-black/25 bg-[#F2FAFF] p-3 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-lg flex items-center space-x-1 mb-1">
            <FaTruck />
            <span className=" font-medium text-black">Truck Expense</span>
          </div>
          <p className='text-center font-semibold text-xl text-black'>₹{formatNumber(truckExpense)}</p>
        </div>

        <div className="flex flex-col items-center border text-black border-black/25 bg-[#F2FAFF] p-3 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-lg flex items-center space-x-1 mb-1">
            <RouteIcon />
            <span className=" font-medium text-black">Trip Expense</span>
          </div>
          <p className='text-center font-semibold text-xl text-black'>₹{formatNumber(tripExpense)}</p>
        </div>

        <div className="flex flex-col items-center border text-black border-black/25 bg-[#F2FAFF] p-3 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-lg flex items-center space-x-1 mb-1">
            <HiBuildingOffice />
            <span className=" font-medium text-black">Office Expense</span>
          </div>
          <p className='text-center font-semibold text-xl text-black'>₹{formatNumber(officeExpense)}</p>
        </div>

        <div className="flex flex-col items-center border text-black border-black/25 bg-[#FF00005E] p-3 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-lg flex items-center space-x-1 mb-1">
            <LuSigma />
            <span className=" font-medium text-black">Total Expense</span>
          </div>
          <p className='text-center font-semibold text-xl text-black'>₹{formatNumber(totalExpense)}</p>
        </div>
      </div>




      <div className="flex items-start gap-16 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.path}
            className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-md text-black hover:bg-[#3190F540] ${pathname === tab.path
              ? 'border-b-2 border-[#3190F5] rounded-b-none'
              : 'border-transparent'
              }`}
          >
            <div className="flex items-center space-x-2">
              {tab.logo}
              <span>{tab.name}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className='p-2 overflow-auto'>{children}</div>

    </div>
  );
};

export default ExpenseLayout;
