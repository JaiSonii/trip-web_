'use client'

import React, { useEffect, useState } from 'react';
import SupplierForm from '@/components/createSupplier';
import { ISupplier } from '@/utils/interface';
import { useRouter } from 'next/navigation';
import { isValidPhone } from '@/utils/validate';
import Loading from '../loading';


const CreateSupplierPage: React.FC = () => {
    const [saving, setSaving] = useState(false)
    const router = useRouter();


    const handlePartySubmit = async (supplier: ISupplier) => {
        setSaving(true)


        if ( supplier.contactNumber && !isValidPhone(supplier.contactNumber)) {
            alert('Invalid phone number. Please enter a 10-digit phone number.');
            setSaving(false)
            return;
        }

        try {

            const res = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplier),
            });

            if (!res.ok) {
                if (res.status === 400) {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.message}`);
                    return;
                } else {
                    alert('An unexpected error occurred. Please try again.');
                    return;
                }
            }

            const data = await res.json();
            console.log(data);
            router.push('/user/suppliers');
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('An error occurred while adding the supplier. Please try again.');
        }finally{
            setSaving(false)
        }
    };

    return (
        <>
            {saving && (
                <div className='absolute inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
                    <Loading />
                </div>
            )}
            <div className='w-full h-full'>
                <SupplierForm onSubmit={handlePartySubmit} />
            </div>
        </>

    );
};

export default CreateSupplierPage;
