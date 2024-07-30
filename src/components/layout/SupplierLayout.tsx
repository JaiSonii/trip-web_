'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaBook, FaTruckMoving, FaEdit, FaTrashAlt, FaPlusCircle } from 'react-icons/fa';
import { Button } from '../ui/button';
import EditSupplierModal from '../supplier/EditSupplierModal';
import AddPaymentModal from '../supplier/AddPaymentModal';
import SupplierBalance from '../supplier/SupplierBalance';

interface TruckLayoutProps {
    children: React.ReactNode;
    supplierId: string;
}

export interface ISupplier {
    supplier_id: string;
    name: string;
    contactNumber: string;
    balance: number;
}

export interface ISupplierAccount {
    user_id: string;
    supplier_id: string;
    amount: number;
    paymentMode: string;
    date: string;
    notes: string;
    refNo: string;
}

const SupplierLayout = ({ children, supplierId }: TruckLayoutProps) => {
    
    const router = useRouter();
    const pathname = usePathname();
    const [supplier, setSupplier] = useState<ISupplier | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

    const tabs = [
        { logo: <FaTruckMoving />, name: 'Trip Book', path: `/user/suppliers/${supplierId}/trips` },
        { logo: <FaBook />, name: 'Passbook', path: `/user/suppliers/${supplierId}/passbook` },
    ];

    useEffect(() => {
        tabs.forEach(tab => {
            router.prefetch(tab.path);
        });

        // Fetch supplier details
        const fetchSupplierDetails = async () => {
            try {
                const response = await fetch(`/api/suppliers/${supplierId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch supplier details');
                }
                const data = await response.json();
                setSupplier(data.supplier);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSupplierDetails();
    }, [supplierId]);

    const handleEditSupplier = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteSupplier = async () => {
        try {
            const response = await fetch(`/api/suppliers/${supplierId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete supplier');
            }
            alert('Supplier deleted successfully');
            router.push('/user/suppliers');
        } catch (error: any) {
            console.error('Failed to delete supplier:', error);
            alert(error.message);
        }
    };

    const handleAddPayment = () => {
        setIsAddPaymentModalOpen(true);
    };

    const handleSaveSupplier = async (updatedSupplier: ISupplier) => {
        try {
            const response = await fetch(`/api/suppliers/${supplierId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedSupplier),
            });
            if (!response.ok) {
                throw new Error('Failed to update supplier');
            }
            setSupplier(updatedSupplier);
            setIsEditModalOpen(false);
            alert('Supplier updated successfully');
        } catch (error) {
            console.error('Failed to update supplier:', error);
        }
    };

    const handleSavePayment = async (payments: any) => {
        try {
            const response = await fetch(`/api/suppliers/${supplierId}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payments),
            });
            if (!response.ok) {
                throw new Error('Failed to add payment');
            }
            setIsAddPaymentModalOpen(false);
            alert('Payment added successfully');
            if(pathname.includes('passbook')) router.refresh()
            else router.push(`/user/suppliers/${supplierId}/passbook`)
            // You might want to fetch the updated supplier details here
        } catch (error) {
            console.error('Failed to add payment:', error);
        }
    };

    return (
        <div className="w-full h-full p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold">{supplier?.name}</h1>
                        <p className="text-gray-600">{supplier?.contactNumber}</p>
                        <p className="text-lg font-semibold p-2">Balance: <SupplierBalance supplierId={supplierId}/></p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleEditSupplier}>
                            <FaEdit className="mr-2" /> Edit Supplier
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSupplier}>
                            <FaTrashAlt className="mr-2" /> Delete Supplier
                        </Button>
                        <Button onClick={handleAddPayment}>
                            <FaPlusCircle className="mr-2" /> Add Payment
                        </Button>
                    </div>
                </div>

                <div className="flex space-x-4 border-b-2 border-gray-200 mt-4">
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

            {supplier && (
                <>
                    <EditSupplierModal
                        supplier={supplier as any}
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={handleSaveSupplier}
                    />
                    <AddPaymentModal
                    supplierId={supplierId}
                        isOpen={isAddPaymentModalOpen}
                        onClose={() => setIsAddPaymentModalOpen(false)}
                        onSave={handleSavePayment}
                    />
                </>
            )}
        </div>
    );
};

export default SupplierLayout;
