// components/layout/TruckLayout.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TruckModel } from '@/utils/interface';
import Link from 'next/link';
import { BsFillFuelPumpFill } from "react-icons/bs";
import { FaTruckMoving } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { RiSteering2Fill } from "react-icons/ri";
import Loading from '@/app/loading';
import { Button } from '../ui/button';
import ExpenseModal from '../trip/tripDetail/ExpenseModal';
import { fuelAndDriverChargeTypes, maintenanceChargeTypes } from '@/utils/utilArray';

interface TruckLayoutProps {
    children: React.ReactNode;
    truckNo: string;
}

const TruckLayout = ({ children, truckNo}: TruckLayoutProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const tabs = [
        { logo: <FaTruckMoving />, name: 'Trip Book', path: `/user/trucks/${truckNo}/trips` },
        { logo: <BsFillFuelPumpFill />, name: 'Fuel Book', path: `/user/trucks/${truckNo}/fuel` },
        { logo: <IoMdSettings />, name: 'Maintenance Book', path: `/user/trucks/${truckNo}/maintainence` },
        { logo: <RiSteering2Fill />, name: 'Driver and Other Expenses', path: `/user/trucks/${truckNo}/driverExpense` },
    ];

    const [truck, setTruck] = useState<TruckModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleAddCharge = async (newCharge: any, id: string | undefined) => {
        const truckExpenseData = {
            expenseType: newCharge.expenseType,
            paymentMode: newCharge.paymentMode,
            transaction_id: newCharge.transactionId || '',
            driver: newCharge.driver || '',
            amount: newCharge.amount,
            date: newCharge.date,
            notes: newCharge.notes || '',
            truck: truckNo,
        };

        if (id) {
            const res = await fetch(`/api/truckExpense/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.status === 500) {
                alert(data.message);
                return;
            }
        }

        const res = await fetch(`/api/trucks/${truckNo}/expense`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(truckExpenseData),
        });
        if (!res.ok) {
            alert('Error');
            return;
        }

        const data = await res.json();
        if (data.status === 500 || data.status === 400) {
            alert(data.message);
            return;
        }

        if (truckExpenseData.expenseType === 'Fuel Expense') router.push(`/user/trucks/${truckNo}/fuel`);
        else if (fuelAndDriverChargeTypes.has(truckExpenseData.expenseType)) router.push(`/user/trucks/${truckNo}/driverExpense`);
        else if (maintenanceChargeTypes.has(truckExpenseData.expenseType)) router.push(`/user/trucks/${truckNo}/maintainence`);
    };

    useEffect(() => {
        const fetchTruckDetails = async () => {
            try {
                const res = await fetch(`/api/trucks/${truckNo}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!res.ok) throw new Error('Failed to fetch truck details');
                const resData = await res.json();
                setTruck(resData.truck);
            } catch (error: any) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTruckDetails();
    }, [truckNo]);

    if (loading) return <Loading />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="w-full h-full p-4">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                        <Button variant="link" className="text-2xl font-bold" onClick={() => router.push(`/user/trucks/${truckNo}`)}>{truckNo}</Button>
                        <span className="text-2xl font-bold">{truck?.status}</span>
                        <span className="text-2xl font-bold">{truck?.truckType} {truck?.model}</span>
                        <span className="text-2xl font-bold">{truck?.ownership}</span>
                    </div>
                    <Button onClick={() => setModalOpen(true)}>Add Expense</Button>
                </div>

                <div className="flex space-x-4 border-b-2 border-gray-200">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`px-4 py-2 transition duration-300 ease-in-out ${pathname === tab.path
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                {tab.logo}
                                <span>{tab.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-4">
                    {children}
                </div>
            </div>

            <ExpenseModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleAddCharge}
                driverId=""
                truckPage={true}
            />
        </div>
    );
};

export default TruckLayout;
