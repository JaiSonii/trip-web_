'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaMapLocationDot } from "react-icons/fa6";
import { FaTruckMoving } from "react-icons/fa";
import Link from 'next/link';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { fetchTruckExpense } from '@/helpers/ExpenseOperation';
import { ITruckExpense } from '@/utils/interface';

interface TruckLayoutProps {
    children: React.ReactNode;
}

// Helper function to generate month-year options
const generateMonthYearOptions = () => {
    const options = [];
    const startDate = new Date(2023, 0, 1); // January 2023
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed, January is 0

    for (let year = startDate.getFullYear(); year <= currentYear; year++) {
        const startMonth = (year === startDate.getFullYear()) ? startDate.getMonth() : 0;
        const endMonth = (year === currentYear) ? currentMonth : 11;
        for (let month = startMonth; month <= endMonth; month++) {
            const date = new Date(year, month, 1);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push(monthYear);
        }
    }

    return options;
};

const ExpenseLayout = ({ children }: TruckLayoutProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
        const monthYear = searchParams.get('monthYear');
        return monthYear ? monthYear : '';
    });
    const [monthYearOptions, setMonthYearOptions] = useState<string[]>([]);
    const [monthExpense, setMonthExpense] = useState(0);

    useEffect(() => {
        setMonthYearOptions(generateMonthYearOptions());
    }, []);

    const handleMonthYearChange = (value: string) => {
        setSelectedMonthYear(value);
        const currentPath = pathname;
        const newUrl = `${currentPath}?monthYear=${value}`;
        router.push(newUrl);
    };

    useEffect(() => {
        const calculateExpense = async () => {
            const [month, year] = selectedMonthYear.split(' ');
            const truckExpenses = await fetchTruckExpense(month, year);
            if (truckExpenses) {
                setMonthExpense(truckExpenses.reduce((total: number, expense: ITruckExpense) => total + expense.amount, 0));
            }
        };
        if (selectedMonthYear) {
            calculateExpense();
        }
    }, [selectedMonthYear]);

    const tabs = [
        { logo: <FaTruckMoving />, name: 'Truck Expense', path: `/user/expenses/truckExpense` },
        { logo: <FaMapLocationDot />, name: 'Trip Expense', path: `/user/expenses/tripExpense` },
    ];

    return (
        <div className='w-full h-full p-4 bg-gray-50'>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Expenses</h1>

            <div className="flex space-x-4 mb-6">
                <Select name="monthYear" value={selectedMonthYear} onValueChange={handleMonthYearChange}>
                    <SelectTrigger className="w-1/3">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthYearOptions.length > 0 ? (
                            monthYearOptions.map((option, index) => (
                                <SelectItem key={index} value={option}>{option}</SelectItem>
                            ))
                        ) : (
                            <div className="p-2 text-gray-500">No options found</div>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className='flex flex-col items-center border border-red-500 bg-red-50 p-4 rounded-md w-1/4 shadow-lg mb-6'>
                <span className="text-lg font-semibold text-red-700">Month Expense: </span>
                <span className="ml-2 text-lg text-red-900">{monthExpense}</span>
            </div>

            <div className="flex space-x-4 border-b-2 border-gray-300 mb-4">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={{
                            pathname: tab.path,
                            query: { monthYear: selectedMonthYear },
                        }}
                        className={`px-4 py-2 transition duration-300 ease-in-out ${pathname === tab.path
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500'
                            }`}
                        prefetch={true}
                    >
                        <div className="flex items-center space-x-2">
                            {tab.logo}
                            <span>{tab.name}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div>{children}</div>
        </div>
    );
};

export default ExpenseLayout;
