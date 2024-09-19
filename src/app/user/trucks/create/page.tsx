// CreateTruck.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { minitruck, openBody, closedContainer, trailer, truckTypes } from '@/utils/utilArray';
import { validateTruckNo } from '@/utils/validate';
import { useRouter, useSearchParams } from 'next/navigation';
import { IDriver, ISupplier, TruckModel } from '@/utils/interface';
import SupplierSelect from '@/components/truck/SupplierSelect';
import AdditionalDetails from '@/components/truck/AdditionalDetails';
import Loading from '../loading';
import { truckTypesIcons } from '@/utils/utilArray';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectValue } from '@/components/ui/select'; // Adjust the import path as necessary
import { Button } from '@/components/ui/button';
import DriverSelect from '@/components/trip/DriverSelect';

// Define the types
type FormData = {
    truckNo: string;
    truckType: string;
    model: string;
    capacity: string;
    bodyLength: number | null;
    ownership: string;
    supplier: string;
    driver : string;
}

// Main CreateTruck component
const CreateTruck: React.FC = () => {
    const router = useRouter();
    const [saving, setSaving] = useState(false)

    const [formdata, setFormdata] = useState<FormData>({
        truckNo: '',
        truckType: '',
        model: '',
        capacity: '',
        bodyLength: null,
        ownership: '',
        supplier: '',
        driver : ''
    });

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [drivers, setDrivers] = useState<IDriver[]>([])
    const params = useSearchParams()
    const nextpath = params.get('nextpath')

    useEffect(() => {
        setSaving(true)
        const fetchSuppliersAndDriver = async () => {
            try {
                const [supplierRes, truckRes] = await Promise.all([fetch('/api/suppliers'), fetch(`/api/drivers`) ])

                const [supplierData, driverData] : any= await Promise.all([supplierRes.ok ? supplierRes.json() : alert('Failed to fetch Suppliers'), truckRes.ok ? truckRes.json() : alert('Failed to fetch Trucks')]) // Parse the response body as JSON
                console.log(driverData)
                setSuppliers(supplierData.suppliers);
                setDrivers(driverData.drivers)
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setSaving(false);
                setLoading(false);
            }
        };

        fetchSuppliersAndDriver();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormdata({
            ...formdata,
            [name]: value
        });
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormdata({
            ...formdata,
            [name]: value
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic form validation
        if (!formdata.truckNo) {
            alert('Enter Truck Number');
            return;
        }

        // Validate truck number
        if (!validateTruckNo(formdata.truckNo)) {
            alert("Please enter a valid Indian truck number.");
            return;
        }

        if (!formdata.ownership) {
            alert('Select Ownership');
            return;
        }

        if (formdata.ownership === 'Market' && !formdata.supplier) {
            alert('Select Supplier');
            return;
        }

        try {
            // Attempt to fetch POST request to backend
            const response = await fetch('/api/trucks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formdata)
            });

            if (!response.ok) {
                // Handle non-200 HTTP responses
                throw new Error('Failed to create truck');
            }

            // Reset form after successful submission
            setFormdata({
                truckNo: '',
                truckType: '',
                model: '',
                capacity: '',
                bodyLength: null,
                ownership: '',
                supplier: '',
                driver : ''
            });
            setShowDetails(false); // Optionally reset additional details state
            const data = await response.json()
            if (data.error){
                alert(data.error)
                return
            }
            if(nextpath){
                const current = JSON.parse(localStorage.getItem('tripData') as any)
                current.truck = data.truck.truckNo
                localStorage.setItem('tripData', JSON.stringify(current))
            }
            router.push(nextpath ? nextpath : '/user/trucks');
        } catch (error) {
            // Handle fetch errors
            console.error('Error creating lorry:', error);
            alert('Failed to add lorry. Please try again later.');
        }
    };

    const renderModelOptions = () => {
        switch (formdata.truckType) {
            case 'Mini Truck / LCV':
                return minitruck;
            case 'Open Body Truck':
                return openBody;
            case 'Closed Container':
                return closedContainer;
            case 'Trailer':
                return trailer;
            default:
                return [];
        }
    }

    if (loading) return <Loading />;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            {saving && (
                <div className='absolute inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
                    <Loading />
                </div>
            )}
            <div className="bg-white text-black p-4 max-w-md mx-auto shadow-md rounded-md">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type='text'
                        name='truckNo'
                        value={formdata.truckNo}
                        placeholder='Enter the Truck Number'
                        onChange={handleInputChange}
                        required
                    />
                    <Select onValueChange={(value) => handleSelectChange('truckType', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Truck Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {truckTypesIcons.map(({ type, Icon }) => (
                                <SelectItem key={type} value={type}>
                                    <Icon className="inline-block mr-2" /> {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => handleSelectChange('ownership', value)}>
                        <SelectTrigger >
                            <SelectValue placeholder="Select Ownership*" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Self'>Self</SelectItem>
                            <SelectItem value='Market'>Market</SelectItem>
                        </SelectContent>
                    </Select>
                    {drivers && <DriverSelect drivers={drivers} formData={formdata} setFormData={setFormdata} handleChange={handleInputChange} />}
                    {formdata.ownership === 'Market' && (
                        <SupplierSelect
                            suppliers={suppliers}
                            value={formdata.supplier}
                            onChange={handleInputChange}
                        />
                    )}
                    {
                        formdata.truckType && !new Set(['Other','Tanker','Tipper']).has(formdata.truckType) &&(
                            <Button
                                className='rounded-full w-full'
                                type="button"
                                onClick={() => setShowDetails(true)}
                            >
                                Add More Details
                            </Button>
                        )
                    }

                    {showDetails && !new Set(['Other','Tanker','Tipper']).has(formdata.truckType) && (
                        <AdditionalDetails
                            formdata={formdata}
                            renderModelOptions={renderModelOptions}
                            handleInputChange={handleInputChange}
                        />
                    )}
                    <Button
                        
                        type="submit"
                    >
                        Submit
                    </Button>
                </form>
            </div>
        </>
    )
}

export default CreateTruck;
