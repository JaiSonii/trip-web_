// components/CreateTruck.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { minitruck, openBody, closedContainer, trailer, truckTypes } from '@/utils/utilArray';
import { validateTruckNo } from '@/utils/validate';
import { useRouter } from 'next/navigation';
import { ISupplier, TruckModel } from '@/utils/interface';
import SupplierSelect from '@/components/truck/SupplierSelect';
import AdditionalDetails from '@/components/truck/AdditionalDetails';
import Loading from '@/app/loading';
import { Button } from '../ui/button';

type FormData = {
    truckNo: string;
    truckType: string;
    model: string;
    capacity: string;
    bodyLength: number | null;
    ownership: string;
    supplier: string;
}

interface EditTruckModalProps {
    truck: TruckModel;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

const EditTruckModal: React.FC<EditTruckModalProps> = ({ truck, isOpen, onClose, onSave }) => {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formdata, setFormdata] = useState<FormData>({
        truckNo: truck.truckNo || '',
        truckType: truck.truckType || '',
        model: truck.model || '',
        capacity: truck.capacity || '',
        bodyLength: truck.bodyLength as any || '',
        ownership: truck.ownership || '',
        supplier: truck.supplier || ''
    });

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await fetch('/api/suppliers', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch suppliers');
                }

                const data = await res.json();
                setSuppliers(data.suppliers);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormdata({
            ...formdata,
            [name]: value
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formdata.truckNo) {
            setError('Enter Truck Number');
            return;
        }

        if (!validateTruckNo(formdata.truckNo)) {
            setError("Please enter a valid Indian truck number.");
            return;
        }

        if (!formdata.ownership) {
            setError('Select Ownership');
            return;
        }

        if (formdata.ownership === 'Market' && !formdata.supplier) {
            setError('Select Supplier');
            return;
        }

        setError(null);
        setSaving(true);

        onSave(formdata)
        setSaving(false)
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

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white text-black p-4 max-w-md mx-auto shadow-md rounded-md relative">
                    {saving && (
                        <div className='absolute inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
                            <Loading />
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md"
                            type='text'
                            name='truckNo'
                            value={formdata.truckNo}
                            placeholder='Enter the Truck Number'
                            onChange={handleInputChange}
                        />
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            name='truckType'
                            value={formdata.truckType}
                            onChange={handleInputChange}
                        >
                            <option value='' disabled>Select Truck Type</option>
                            {truckTypes.map((truckType, index) => (
                                <option key={index} value={truckType}>{truckType}</option>
                            ))}
                        </select>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            name='ownership'
                            value={formdata.ownership}
                            onChange={handleInputChange}
                        >
                            <option value='' disabled>Select Ownership</option>
                            <option value='Self'>Self</option>
                            <option value='Market'>Market</option>
                        </select>
                        {formdata.ownership === 'Market' && (
                            <SupplierSelect
                                suppliers={suppliers}
                                value={formdata.supplier}
                                onChange={handleInputChange}
                            />
                        )}
                        {formdata.truckType !== 'Other' && (
                            <button
                                className="w-full p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
                                type="button"
                                onClick={() => setShowDetails(true)}
                            >
                                Add More Details
                            </button>
                        )}
                        {showDetails && formdata.truckType !== 'Other' && (
                            <AdditionalDetails
                                formdata={formdata}
                                renderModelOptions={renderModelOptions}
                                handleInputChange={handleInputChange}
                            />
                        )}
                        {error && <div className="text-red-500">{error}</div>}
                        <div className='flex flex-row w-full justify-end gap-2'>
                            <Button
                                type="submit"
                            >
                                Submit
                            </Button>
                            <Button
                                variant={'ghost'}
                                onClick={() => onClose()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditTruckModal;
