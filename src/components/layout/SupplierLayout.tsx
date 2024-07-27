'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaBook } from "react-icons/fa";
import { FaTruckMoving } from "react-icons/fa6";

interface TruckLayoutProps {
    children: React.ReactNode;
    supplierId: string;
}

const SupplierLayout = ({ children, supplierId }: TruckLayoutProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const tabs = [
        { logo: <FaTruckMoving />, name: 'Trip Book', path: `/user/suppliers/${supplierId}/trips` },
        { logo: <FaBook />, name: 'Passbook', path: `/user/suppliers/${supplierId}/passbook` },
    ];


    useEffect(() => {
        tabs.forEach(tab => {
            router.prefetch(tab.path);
        });
    }, [tabs, router]);

    return (
        <div className="w-full h-full p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex flex-col space-y-4">

                <div className="flex space-x-4 border-b-2 border-gray-200">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`px-4 py-2 transition duration-300 ease-in-out ${
                                pathname === tab.path
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

                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
};

export default SupplierLayout;
