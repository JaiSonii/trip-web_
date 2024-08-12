'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt, FaTruckMoving } from 'react-icons/fa';
import Link from 'next/link';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { calculateTripExpense, calculateTruckExpense, handleAddCharge } from '@/helpers/ExpenseOperation';
import { IExpense } from '@/utils/interface';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import { IoAddCircle } from 'react-icons/io5';
import { RiHomeOfficeFill } from 'react-icons/ri';
import { FaRoute } from 'react-icons/fa6';

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
  const [modalOpen, setModalOpen] = useState(false)

  const handleSave = async (data: any) => {
    if (!data.trip && !data.truck) {
      alert('Trip and Truck Not Specified')
      return
    }
    try {
      if (data.trip != '') {
        await fetch(`/api/trips/${data.trip}/truckExpense`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      } else {
        await handleAddCharge(data, '', data.truck)
      }
    } catch (error: any) {
      alert(error.message)
      console.log(error)
    } finally {
      router.refresh()
    }

  }


  useEffect(() => {
    const fetchExpenses = async (value: string) => {
      setSelectedMonthYear(value);
      router.push(`${pathname}?monthYear=${value}`);

      const [month, year] = value.split(' ');
      const [truckExpenses, tripExpenses] = await Promise.all([
        calculateTruckExpense(month, year),
        calculateTripExpense(month, year),
      ]);

      setTruckExpense(truckExpenses);
      setTripExpense(tripExpenses);
      setMonthExpense(truckExpenses + tripExpenses);
    };

    fetchExpenses(selectedMonthYear);
  }, [pathname, router, selectedMonthYear]);

  const monthYearOptions = generateMonthYearOptions();

  const tabs = [
    { logo: <FaTruckMoving />, name: 'Truck Expense', path: `/user/expenses/truckExpense` },
    { logo: <FaRoute />, name: 'Trip Expense', path: `/user/expenses/tripExpense` },
    {logo: <RiHomeOfficeFill />, name: 'Office Expense', path: `/user/expenses/OfficeExpense`}
  ];

  return (
    <div className="w-full h-full p-4 bg-gray-50">
      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold mb-4 text-bottomNavBarColor">Expenses</h1>
        <Button onClick={() => setModalOpen(true)}>
          <div className='flex items-center space-x-1 justify-center min-h-full'>
            <span>Add Expense</span>
            <IoAddCircle />
          </div>

        </Button>
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

      <div className="flex flex-col md:flex-row justify-start gap-4 mb-6">
        <div className="flex flex-col items-center border border-red-300 bg-red-50 p-4 rounded-lg w-full md:w-1/3 shadow transition-transform transform hover:scale-105">
          <span className="text-lg font-semibold text-red-600">Total Month Expense</span>
          <span className="text-2xl font-bold text-red-800">{monthExpense}</span>
        </div>

        <div className="flex flex-col items-center border border-blue-300 bg-blue-50 p-4 rounded-lg w-full md:w-1/3 shadow transition-transform transform hover:scale-105">
          <span className="text-lg font-semibold text-blue-600">Truck Expense</span>
          <span className="text-2xl font-bold text-blue-800">{truckExpense}</span>
        </div>

        <div className="flex flex-col items-center border border-green-300 bg-green-50 p-4 rounded-lg w-full md:w-1/3 shadow transition-transform transform hover:scale-105">
          <span className="text-lg font-semibold text-green-600">Trip Expense</span>
          <span className="text-2xl font-bold text-green-800">{tripExpense}</span>
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

      <div>{children}</div>
      <ExpenseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} driverId='' />
    </div>
  );
};

export default ExpenseLayout;
