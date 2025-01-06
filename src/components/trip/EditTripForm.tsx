'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PartySelect } from './PartySelect';
import TruckSelect from './TruckSelect';
import DriverSelect from './DriverSelect';
import RouteInputs from './RouteInputs';
import { IDriver, IParty, ITrip, TruckModel } from '@/utils/interface';
import { DateInputs } from './DateInputs';
import { Button } from '../ui/button';
import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { BillingInfo } from './BillingInfo';
import { useToast } from '../hooks/use-toast';
import { useExpenseData } from '../hooks/useExpenseData';

type Props = {
    trip: ITrip;
    onSubmit: (tripData: Partial<ITrip>) => void;
    onClose: () => void
    isOpen: boolean
};

const EditTripForm: React.FC<Props> = ({ onSubmit, trip, onClose, isOpen }) => {
    const { parties, trucks, drivers, isLoading } = useExpenseData();
    const { toast } = useToast()
    const modalRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose(); // Close modal if clicked outside
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const [formData, setFormData] = useState(() => ({
        party: trip?.party || '',
        truck: trip?.truck || '',
        driver: trip?.driver || '',
        route: { origin: trip?.route?.origin || '', destination: trip?.route?.destination || '' },
        billingType: trip?.billingType || '',
        amount: trip?.amount || 0,
        startDate: new Date(trip?.startDate),
        truckHireCost: trip?.truckHireCost || 0,
        LR: trip?.LR || '',
        material: trip?.material || '',
        notes: trip?.notes || '',
        ewbValidity: trip?.documents?.find((doc) => doc.type === 'E-Way Bill')?.validityDate || null,
        totalUnits: trip?.units || 0,
        perUnit: trip?.rate || 0
    }));

    const [showDetails, setShowDetails] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState<TruckModel | undefined>(undefined);
    const [hasSupplier, setHasSupplier] = useState(false);

    useEffect(() => {
        const updatedTruck = trucks.find(truck => truck.truckNo === formData.truck);
        setSelectedTruck(updatedTruck);
        setHasSupplier(!!updatedTruck?.supplier);
    }, [formData.truck, trucks]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prevState => {
            if (name.includes('route.')) {
                const routeField = name.split('.')[1];
                return {
                    ...prevState,
                    route: {
                        ...prevState.route,
                        [routeField]: value,
                    },
                };
            } else {
                return {
                    ...prevState,
                    [name]: value,
                };
            }
        });
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount - (trip.amount - trip.balance) < 0) {
            toast({
                description: 'Pending is Negative',
                variant: 'warning'
            })

        }
        const sanitizeInput = (value: string) => {
            const sanitizedValue = parseFloat(value.replace(/,/g, '').trim())
            return !isNaN(Number(sanitizedValue)) ? sanitizedValue : null
        }

        const sanitizedAmount = sanitizeInput(formData.amount.toString())
        onSubmit({ ...formData, units: formData.totalUnits, rate: formData.perUnit, amount: Number(sanitizedAmount) });
    }, [formData, onSubmit]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '0') {
            handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
    }, [handleChange]);

    const memoizedPartySelect = useMemo(() => (
        <PartySelect parties={parties} formData={formData} handleChange={handleChange} />
    ), [parties, formData.party, handleChange]);

    const memoizedTruckSelect = useMemo(() => (
        <TruckSelect
            trucks={trucks}
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
        />
    ), [trucks, formData.truck, handleChange, selectedTruck, hasSupplier]);

    const memoizedDriverSelect = useMemo(() => (
        <DriverSelect drivers={drivers} formData={formData} handleChange={handleChange} setFormData={setFormData} />
    ), [drivers, formData.driver, handleChange]);

    if (!isOpen) {
        return null
    }
    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-full'>
                <Loader2 className='animate-spin text-bottomNavBarColor' />
            </div>
        );
    }

    return (
        <div className="modal-class">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0, 0.71, 0.2, 1.01]
                }}
                ref={modalRef}
                className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[700px] overflow-y-auto thin-scrollbar"
            >
                <Button variant={'outline'} onClick={() => onClose()} className='absolute right-0 top-0 border-0 rounded-none'>
                    <X size={15} />
                </Button>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <BillingInfo formData={formData} handleChange={handleChange} setFormData={setFormData} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {memoizedPartySelect}
                        {memoizedTruckSelect}
                    </div>

                    {memoizedDriverSelect}

                    <RouteInputs formData={formData} handleChange={handleChange} />

                    <div className='grid grid-cols-2 gap-2'>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">EWB Validity</label>
                            <input
                                type="date"
                                name="ewbValidity"
                                value={formData.ewbValidity ? new Date(formData.ewbValidity).toISOString().split('T')[0] : ''}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">LR No</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                name="LR"
                                value={formData.LR}
                                onChange={handleChange}
                                placeholder="LR No"
                            />
                        </div>
                    </div>



                    <DateInputs formData={formData} handleChange={handleChange} />

                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={showDetails}
                                onChange={() => setShowDetails(!showDetails)}
                            />
                            Edit More Details
                        </label>
                    </div>

                    {showDetails && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Material Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    name="material"
                                    value={formData.material}
                                    placeholder="Material Name"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    name="notes"
                                    value={formData.notes}
                                    placeholder="Notes"
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    {hasSupplier && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Truck Hire Cost</label>
                            <textarea
                                className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lightOrange transition-all duration-300"
                                value={formData.notes}
                                name="notes"
                                onChange={handleChange}
                                placeholder="Enter notes..."
                                rows={4}
                            />
                        </div>
                    )}
                </form>
                <div className="p-4 bg-white border-t flex items-center justify-end gap-2">
                    <Button onClick={() => onClose()} variant={'outline'}>
                        Cancel
                    </Button>
                    <Button
                        className=''
                        type="submit"
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default EditTripForm;

