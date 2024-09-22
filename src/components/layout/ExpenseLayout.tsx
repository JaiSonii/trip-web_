'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt, FaTruckMoving } from 'react-icons/fa';
import Link from 'next/link';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { calculateOfficeExpense, calculateTripExpense, calculateTruckExpense, handleAddCharge } from '@/helpers/ExpenseOperation';
import { IExpense } from '@/utils/interface';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import { IoAddCircle } from 'react-icons/io5';
import { RiHomeOfficeFill } from 'react-icons/ri';
import { FaRoute, FaTruck } from 'react-icons/fa6';
import { RouteIcon } from 'lucide-react';
import { HiBuildingOffice } from 'react-icons/hi2';
import { BsFillEmojiExpressionlessFill } from 'react-icons/bs';
import { formatNumber } from '@/utils/utilArray';

const ExpenseModal = dynamic(() => import('@/components/trip/tripDetail/ExpenseModal'))

interface TruckLayoutProps {
  children: React.ReactNode;
}

const generateMonthYearOptions = () => {
  const options = [];
  const startDate = new Date(2023, 0, 1);
  const currentDate = new Date();

  for (let year = startDate.getFullYear(); year <= currentDate.getFullYear(); year++) {
    const startMonth = (year === startDate.getFullYear()) ? startDate.getMonth() : 0;
    const endMonth = (year === currentDate.getFullYear()) ? currentDate.getMonth() : 11;

    for (let month = startMonth; month <= endMonth; month++) {
      const date = new Date(year, month, 1);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push(monthYear);
    }
  }


  return options;
};

const ExpenseLayout: React.FC<TruckLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedMonthYear, setSelectedMonthYear] = useState(() => searchParams.get('monthYear') || generateMonthYearOptions()[0]);
  const [truckExpense, setTruckExpense] = useState(0);
  const [tripExpense, setTripExpense] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [officeExpense, setOfficeExpense] = useState(0)
  const [previousMonthExpense, setPreviousMonthExpense] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(0);


  const calculatePercentageIncrease = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };



  useEffect(() => {
    const fetchExpenses = async (value: string) => {
      setSelectedMonthYear(value);
      router.push(`${pathname}?monthYear=${value}`);

      const [month, year] = value.split(' ');
      const [truckExpenses, tripExpenses, officeExpenses] = await Promise.all([
        calculateTruckExpense(month, year),
        calculateTripExpense(month, year),
        calculateOfficeExpense(month, year)
      ]);

      setTruckExpense(truckExpenses);
      setTripExpense(tripExpenses);
      setOfficeExpense(officeExpenses);

      const currentMonthExpense = truckExpenses + tripExpenses + officeExpenses;
      setMonthExpense(currentMonthExpense);

      // Calculate the previous month's expenses
      const previousMonth = new Date(parseInt(year), new Date(Date.parse(month + " 1, " + year)).getMonth() - 1, 1);
      const [prevMonth, prevYear] = [previousMonth.toLocaleString('default', { month: 'long' }), previousMonth.getFullYear().toString()];
      console.log(prevMonth,prevYear)

      const [prevTruckExpenses, prevTripExpenses, prevOfficeExpenses] = await Promise.all([
        calculateTruckExpense(prevMonth, prevYear),
        calculateTripExpense(prevMonth, prevYear),
        calculateOfficeExpense(prevMonth, prevYear)
      ]);

      const previousTotalExpense = prevTruckExpenses + prevTripExpenses + prevOfficeExpenses;
      setPreviousMonthExpense(previousTotalExpense);

      // Calculate the percentage increase
      const percentageIncrease = calculatePercentageIncrease(currentMonthExpense, previousTotalExpense);
      setPercentageIncrease(percentageIncrease);
    };

    fetchExpenses(selectedMonthYear);
  }, [pathname, router, selectedMonthYear]);

  const monthYearOptions = generateMonthYearOptions();

  const tabs = [
    { logo: <FaTruckMoving />, name: 'Truck Expense', path: `/user/expenses/truckExpense` },
    { logo: <FaRoute />, name: 'Trip Expense', path: `/user/expenses/tripExpense` },
    { logo: <RiHomeOfficeFill />, name: 'Office Expense', path: `/user/expenses/officeExpense` }
  ];

  return (
    <div className="w-full h-full p-4 bg-gray-50">
      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold mb-4 text-bottomNavBarColor">Expenses</h1>
      </div>


      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <Select name="monthYear" value={selectedMonthYear} onValueChange={setSelectedMonthYear}>
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {monthYearOptions.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row justify-start gap-6 mb-8">

        <div className="flex flex-col items-center border border-blue-300 bg-blue-50 p-6 rounded-lg w-full md:w-1/4 shadow-lg transition-all transform hover:scale-105">
          <div className="flex items-center gap-2">
            <FaTruck />
            <span className="text-lg font-semibold text-blue-600">Truck Expense</span>
          </div>
          <span className="text-3xl font-bold text-blue-800 mt-4">₹{formatNumber(truckExpense)}</span>
        </div>

        <div className="flex flex-col items-center border border-green-300 bg-green-50 p-6 rounded-lg w-full md:w-1/4 shadow-lg transition-all transform hover:scale-105">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <RouteIcon />
            </svg>
            <span className="text-lg font-semibold text-green-600">Trip Expense</span>
          </div>
          <span className="text-3xl font-bold text-green-800 mt-4">₹{formatNumber(tripExpense)}</span>
        </div>

        <div className="flex flex-col items-center border border-yellow-300 bg-yellow-50 p-6 rounded-lg w-full md:w-1/4 shadow-lg transition-all transform hover:scale-105">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <HiBuildingOffice />
            </svg>
            <span className="text-lg font-semibold text-yellow-600">Office Expense</span>
          </div>
          <span className="text-3xl font-bold text-yellow-800 mt-4">₹{formatNumber(officeExpense)}</span>
        </div>

        <div className="flex flex-col items-center border border-red-300 bg-red-50 p-6 rounded-lg w-full md:w-1/4 shadow-lg transition-all transform hover:scale-105">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <BsFillEmojiExpressionlessFill />
            </svg>
            <span className="text-lg font-semibold text-red-600">Total Month Expense</span>
          </div>
          <span className="text-3xl font-bold text-red-800 mt-4">₹{formatNumber(monthExpense)}</span>
          <span className="text-sm font-medium text-red-600 mt-2">{percentageIncrease >= 0 ? `+${percentageIncrease.toFixed(2)}%` : `${percentageIncrease.toFixed(2)}%`} compared to last month</span>
        </div>

      </div>


      <div className="flex border-b-2 border-lightOrange mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={{ pathname: tab.path, query: { monthYear: selectedMonthYear } }}
            className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-lightOrangeButtonColor ${pathname === tab.path
              ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange'
              : 'border-transparent text-buttonTextColor hover:bottomNavBarColor hover:border-bottomNavBarColor'
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
