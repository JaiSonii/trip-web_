'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PartySelect } from './PartySelect';
import TruckSelect from './TruckSelect';
import DriverSelect from './DriverSelect';
import RouteInputs from './RouteInputs';
import { IDriver, IParty, ITrip, TruckModel } from '@/utils/interface';
import { DateInputs } from './DateInputs';
import { Button } from '../ui/button';
import { useExpenseCtx } from '@/context/context';
import { Loader2 } from 'lucide-react';

type Props = {
    trip: ITrip;
    onSubmit: (tripData: Partial<ITrip>) => void;
};

const EditTripForm: React.FC<Props> = ({ onSubmit, trip }) => {
    const { parties, trucks, drivers, isLoading } = useExpenseCtx();

    const [formData, setFormData] = useState(() => ({
        party: trip.party || '',
        truck: trip.truck || '',
        driver: trip.driver || '',
        route: { origin: trip.route?.origin || '', destination: trip.route?.destination || '' },
        billingType: trip.billingType || '',
        amount: trip.amount || 0,
        startDate: new Date(trip.startDate),
        truckHireCost: trip.truckHireCost || 0,
        LR: trip.LR || '',
        material: trip.material || '',
        notes: trip.notes || '',
        ewbValidity: trip.documents?.find((doc) => doc.type === 'E-Way Bill')?.validityDate || null
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
        onSubmit(formData);
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
            selectedTruck={selectedTruck}
            hasSupplier={hasSupplier}
            setFormData={setFormData}
        />
    ), [trucks, formData.truck, handleChange, selectedTruck, hasSupplier]);

    const memoizedDriverSelect = useMemo(() => (
        <DriverSelect drivers={drivers} formData={formData} handleChange={handleChange} setFormData={setFormData} />
    ), [drivers, formData.driver, handleChange]);

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-full'>
                <Loader2 className='animate-spin text-bottomNavBarColor' />
            </div>
        );
    }

    return (
        <div className="bg-white text-black h-full flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {memoizedPartySelect}
                        {memoizedTruckSelect}
                    </div>

                    {memoizedDriverSelect}

                    <RouteInputs formData={formData} handleChange={handleChange} />

                    <div className='grid grid-cols-2 gap-2'>
                        <div>
                            <label className="block">
                                <span className="block text-xs font-medium text-gray-700 mb-1">Freight Amount</span>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    type="number"
                                    name="amount"
                                    value={formData.amount || ''}
                                    placeholder="Freight Amount"
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    required
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Validity Date</label>
                            <input
                                type="date"
                                name="ewbValidity"
                                value={formData.ewbValidity ? new Date(formData.ewbValidity).toISOString().split('T')[0] : ''}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
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
                    )}

                    {hasSupplier && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Truck Hire Cost</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                name="truckHireCost"
                                value={formData.truckHireCost}
                                placeholder="Truck Hire Cost"
                                onChange={handleChange}
                                onFocus={handleFocus}
                            />
                        </div>
                    )}
                </form>
            </div>
            <div className="p-4 bg-white border-t">
                <Button
                    className='w-full'
                    type="submit"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
};

export default EditTripForm;