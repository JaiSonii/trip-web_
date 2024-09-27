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
      console.log(prevMonth, prevYear)

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
      <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center mb-6">
        <div className="w-full flex justify-between">
          <h1 className="text-2xl font-bold mb-2 text-bottomNavBarColor">Expenses Overview</h1>
          <div className="flex items-center space-x-4">
            <Select name="monthYear" value={selectedMonthYear} onValueChange={setSelectedMonthYear}>
              <SelectTrigger className="w-full lg:w-64">
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
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <div className="flex flex-col items-start border border-blue-200 bg-blue-50 p-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-1 mb-1">
            <FaTruck className="text-blue-500" />
            <span className="text-md font-medium text-blue-600">Truck Expense</span>
          </div>
          <span className="text-xl font-semibold text-blue-800">₹{formatNumber(truckExpense)}</span>
        </div>

        <div className="flex flex-col items-start border border-green-200 bg-green-50 p-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-1 mb-1">
            <RouteIcon className="text-green-500" />
            <span className="text-md font-medium text-green-600">Trip Expense</span>
          </div>
          <span className="text-xl font-semibold text-green-800">₹{formatNumber(tripExpense)}</span>
        </div>

        <div className="flex flex-col items-start border border-yellow-200 bg-yellow-50 p-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-1 mb-1">
            <HiBuildingOffice className="text-yellow-500" />
            <span className="text-md font-medium text-yellow-600">Office Expense</span>
          </div>
          <span className="text-xl font-semibold text-yellow-800">₹{formatNumber(officeExpense)}</span>
        </div>

        <div className="flex flex-col items-start border border-red-200 bg-red-50 p-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-1 mb-1">
            <BsFillEmojiExpressionlessFill className="text-red-500" />
            <span className="text-md font-medium text-red-600">Total Month Expense</span>
          </div>
          <span className="text-xl font-semibold text-red-800">₹{formatNumber(monthExpense)}</span>
          <span className={`text-xs font-medium mt-1 ${percentageIncrease <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {percentageIncrease >= 0 ? `+${percentageIncrease.toFixed(2)}%` : `${percentageIncrease.toFixed(2)}%`} compared to last month
          </span>
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
