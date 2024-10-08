import React, { useState, useEffect } from 'react';
import { PartySelect } from './PartySelect';
import TruckSelect from './TruckSelect';
import DriverSelect from './DriverSelect';
import RouteInputs from './RouteInputs';
import { IDriver, IParty, ITrip, TruckModel } from '@/utils/interface';
import { DateInputs } from './DateInputs';
import { Button } from '../ui/button';

type Props = {
    parties: IParty[];
    trucks: TruckModel[];
    drivers: IDriver[];
    trip: ITrip;
    onSubmit: (tripData: Partial<ITrip>) => void;
};

const EditTripForm: React.FC<Props> = ({ parties, trucks, drivers, onSubmit, trip }) => {
    const [formData, setFormData] = useState({
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
    });

    const [showDetails, setShowDetails] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState<TruckModel | undefined>(undefined);
    const [hasSupplier, setHasSupplier] = useState(false);

    useEffect(() => {
        const updatedTruck = trucks.find(truck => truck.truckNo === formData.truck);
        setSelectedTruck(updatedTruck);
        setHasSupplier(!!updatedTruck?.supplier);
    }, [formData.truck, trucks]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.includes('route.')) {
            const routeField = name.split('.')[1];
            setFormData(prevState => ({
                ...prevState,
                route: {
                    ...prevState.route,
                    [routeField]: value,
                },
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as ITrip);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '0') {
            handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    return (
        <div className="bg-white text-black p-4 max-w-3xl mx-auto shadow-md rounded-md">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PartySelect parties={parties} formData={formData} handleChange={handleChange} />
                    <TruckSelect
                        trucks={trucks}
                        formData={formData}
                        handleChange={handleChange}
                        selectedTruck={selectedTruck}
                        hasSupplier={hasSupplier}
                        setFormData={setFormData}
                    />
                </div>

                <DriverSelect drivers={drivers} formData={formData} handleChange={handleChange} setFormData={setFormData} />

                <RouteInputs formData={formData} handleChange={handleChange} />

                <label className="block">
                    <span className="text-gray-700">Freight Amount</span>
                    <input
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                        type="number"
                        name="amount"
                        value={formData.amount || ''}
                        placeholder="Freight Amount"
                        onChange={handleChange}
                        required
                    />
                </label>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">LR No</label>
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

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Material Name</label>
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Truck Hire Cost</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            name="truckHireCost"
                            value={formData.truckHireCost}
                            placeholder="Truck Hire Cost"
                            onChange={handleChange}
                        />
                    </div>
                )}

                <Button
                    className='w-full'
                    type="submit"
                >
                    Submit
                </Button>
            </form>
        </div>
    );
};

export default EditTripForm;
