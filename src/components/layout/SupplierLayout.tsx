'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaBook, FaTruckMoving, FaEdit, FaTrashAlt, FaPlusCircle, FaTruck } from 'react-icons/fa';
import { Button } from '../ui/button';
import EditSupplierModal from '../supplier/EditSupplierModal';
import AddPaymentModal from '../supplier/AddPaymentModal';
import SupplierBalance from '../supplier/SupplierBalance';
import { useSupplier } from '@/context/supplierContext';
import Loading from '@/app/user/suppliers/loading';
import { formatNumber } from '@/utils/utilArray';
import { Frown } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface TruckLayoutProps {
    children: React.ReactNode;
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

const SupplierLayout = ({ children }: TruckLayoutProps) => {

    const { supplier, setSupplier, loading } = useSupplier()

    const router = useRouter();
    const pathname = usePathname();
    const { supplierId } = useParams()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    
    const {toast} = useToast()

    const tabs = [
        { logo: <FaTruckMoving />, name: 'Trip Book', path: `/user/suppliers/${supplierId}/trips` },
        { logo: <FaBook />, name: 'Passbook', path: `/user/suppliers/${supplierId}/passbook` },
        { logo: <FaTruck />, name: 'Trucks', path: `/user/suppliers/${supplierId}/trucks` },
    ];

    // useEffect(() => {
    //     tabs.forEach(tab => {
    //         router.prefetch(tab.path);
    //     });

    //     // Fetch supplier details
    //     const fetchSupplierDetails = async () => {
    //         try {
    //             const response = await fetch(`/api/suppliers/${supplierId}`);
    //             if (!response.ok) {
    //                 throw new Error('Failed to fetch supplier details');
    //             }
    //             const data = await response.json();
    //             setSupplier(data.supplier);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };

    //     fetchSupplierDetails();
    // }, [supplierId]);

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
            setSupplier((prev: any) => ({
                ...prev,
                ...updatedSupplier
            }));
            setIsEditModalOpen(false);
            toast({
                description : 'Supplier updated successfully'});
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
                alert('Failed to add payment');
                throw new Error('Failed to add payment');
            }

            const data = await response.json();
            let savedBal = 0
            const saved = data.payments.map((item: any) => {
                savedBal += item.amount
                return {
                    ...item,
                    type: 'payment',
                }
            });

            setIsAddPaymentModalOpen(false);
            // Update supplier's `supplierTripAccounts` by concatenating the new payments
            setSupplier((prev: any) => ({
                ...prev,
                supplierTripAccounts: [...saved, ...prev.supplierTripAccounts], // Concatenate the new payments with existing data
                balance: prev.balance + savedBal
            }));
            toast({
                description : 'Payment Added Successfully',
                variant : 'default'
            })

            // You might want to fetch the updated supplier details here if needed
        } catch (error: any) {
            alert(error.message);
            console.error('Failed to add payment:', error);
        }
    };


    if (loading) return <Loading />

    if(!supplier){
        return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Supplier Not Found</div>
      }

    return (
        <div className="w-full h-full p-4 bg-white ">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold">{supplier?.name}</h1>
                        <p className="text-gray-600">{supplier?.contactNumber}</p>
                        <p className="text-lg font-semibold p-2 flex items-center space-x-2">Balance: <p className={`font-semibold ml-2 ${supplier.balance >= 0 ? 'text-green-500' : "text-red-500"}`}>₹{formatNumber(Math.abs(supplier.balance))}</p></p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleEditSupplier}>
                            <FaEdit className="mr-2" /> Edit Supplier
                        </Button>
                        {/* <Button variant="destructive" onClick={handleDeleteSupplier}>
                            <FaTrashAlt className="mr-2" /> Delete Supplier
                        </Button> */}
                        <Button onClick={handleAddPayment}>
                            <FaPlusCircle className="mr-2" /> Add Payment
                        </Button>
                    </div>
                </div>

                <div className="flex border-b-2 border-lightOrange mt-4">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-lightOrangeButtonColor ${pathname === tab.path
                                ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange'
                                : 'border-transparent text-buttonTextColor hover:bottomNavBarColor hover:border-bottomNavBarColor'
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
                        supplierId={supplierId as string}
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
