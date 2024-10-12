'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fuelAndDriverChargeTypes, maintenanceChargeTypes, officeExpenseTypes } from '@/utils/utilArray';
import { IDriver, IExpense, ITrip, TruckModel } from '@/utils/interface';
import { motion } from 'framer-motion';
import { useParams, usePathname } from 'next/navigation';
import { statuses } from '@/utils/schema';
import DriverSelect from './trip/DriverSelect';
import ShopSelect from './shopkhata/ShopSelect';
import { useExpenseCtx } from '@/context/context';

interface ChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: any;
    driverId: string;
    selected?: any;
    categories: string[]
    tripId?: string
    truckNo?: string
}

interface TripExpense {
    id?: string;
    trip_id: string;
    partyBill: boolean;
    amount: number;
    date: Date;
    expenseType: string;
    notes?: string;
    partyAmount: number;
    paymentMode: string;
    transactionId: string;
    driver: string;
    truck?: string
    shop_id?: string
}

const AddExpenseModal: React.FC<ChargeModalProps> = ({ categories, isOpen, onClose, onSave, driverId, selected, tripId, truckNo }) => {

    const { trips, drivers, shops, trucks, isLoading, error } = useExpenseCtx();

    const [formData, setFormData] = useState<TripExpense>({
        id: selected?._id || undefined,
        trip_id: selected?.trip_id ? selected.trip_id : tripId ? tripId : '',
        partyBill: false,
        amount: selected?.amount || 0,
        date: selected?.date ? new Date(selected.date) : new Date(),
        expenseType: selected?.expenseType || '',
        notes: selected?.notes || '',
        partyAmount: 0,
        paymentMode: selected?.paymentMode || 'Cash',
        transactionId: selected?.transaction_id || '',
        driver: selected?.driver || driverId || '',
        truck: selected?.truck || truckNo || '',
        shop_id: selected?.shop_id || ''
    });

    const pathname = usePathname()
    const truckpage = pathname === '/user/expenses/truckExpense' || pathname.startsWith('/user/trucks/')
    const trippage = pathname === '/user/expenses/tripExpense' || pathname.startsWith('/user/trips/')
    const officepage = pathname === '/user/expenses/officeExpense'


    const [driverName, setDriverName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(truckpage ? 'Truck Expense' : trippage ? 'Trip Expense' : officepage ? 'Office Expense' : '');
    const [trip, setTrip] = useState<ITrip | undefined>()


    useEffect(() => {
        if (!selected) return;
        setFormData({
            id: selected?._id || undefined,
            trip_id: selected?.trip_id ? selected.trip_id : tripId ? tripId : '',
            partyBill: false,
            amount: selected?.amount || 0,
            date: selected?.date ? new Date(selected.date) : new Date(),
            expenseType: selected?.expenseType || '',
            notes: selected?.notes || '',
            partyAmount: 0,
            paymentMode: selected?.paymentMode || 'Cash',
            transactionId: selected?.transaction_id || '',
            driver: selected?.driver || '',
            truck: selected?.truck || truckNo || '',
            shop_id: selected?.shop_id || '',
        });
    }, [selected]);

    const expenseTypes = useMemo(() => {
        setFormData((prev) => ({ ...prev, expenseType: "" }))
        if (selectedCategory === 'Truck Expense') return Array.from(maintenanceChargeTypes)
        else if (selectedCategory === 'Trip Expense') return Array.from(fuelAndDriverChargeTypes)
        else if (selectedCategory === 'Office Expense') return Array.from(officeExpenseTypes)
        if (selected) {
            if (maintenanceChargeTypes.has(selected.expenseType)) {
                setSelectedCategory('Truck Expense')
                return Array.from(maintenanceChargeTypes)
            }
            if (fuelAndDriverChargeTypes.has(selected.expenseType)) {
                setSelectedCategory('Trip Expense')
                return Array.from(fuelAndDriverChargeTypes)
            }
            if (officeExpenseTypes.includes(selected.expenseType)) {
                setSelectedCategory('Office Expense')
                return officeExpenseTypes
            }
        }

        return []

    }, [selectedCategory, selected])

    const paymentModes = useMemo(() => {
        if (selectedCategory !== 'Office Expense') {
            return ['Cash', 'Online', 'Paid By Driver', 'Credit']
        } else return ['Cash', 'Online', 'Credit']
    }, [selectedCategory])

    // useEffect(() => {
    //     const fetchDriverName = async () => {
    //         const result = await fetch(`/api/drivers/${driverId || trip?.driver}`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });
    //         const data = await result.json();
    //         setDriverName(data.name || 'Driver Not Found');
    //     };
    //     if (formData.paymentMode === 'Paid By Driver') fetchDriverName();


    // }, [formData.paymentMode, driverId]);


    useEffect(() => {
        if (formData.paymentMode === 'Paid By Driver' && trip) {
            setFormData((prevData) => ({ ...prevData, driver: trip.driver }));
        }
    }, [trip, formData.paymentMode])

    useEffect(() => {
        if (formData.truck && pathname === '/user/expenses/tripExpense') {
            let tempTrips = trips?.filter((trip) => trip.truck === formData.truck)
            setFormData((prev) => ({
                ...prev,
                trip_id: tempTrips ? tempTrips[0]?.trip_id : ''
            }))
            setTrip(tempTrips ? tempTrips[0] : undefined)
        }
    }, [formData.truck])

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            if (name === 'trip_id') {
                const selectedTrip = trips?.find((trip) => trip.trip_id === value);
                if (selectedTrip && selectedTrip.truck) {
                    updatedData = { ...updatedData, truck: selectedTrip.truck };
                }
            }

            return updatedData;
        });
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? !formData.partyBill : value });
    };

    const handleSave = () => {
        if (selectedCategory === 'Truck Expense') setFormData((prev) => ({ ...prev, trip_id: '' }))
        else if (selectedCategory === 'Office Expense') setFormData((prev) => ({ ...prev, trip_id: '', truck: '' }))
        const missingFields = [];

        if (!formData.amount) missingFields.push("Amount");
        if (!formData.date) missingFields.push("Date");
        if (!formData.expenseType) missingFields.push("Expense Type");
        if (selectedCategory === 'Truck Expense' && !formData.truck) missingFields.push("Truck");
        if (selectedCategory === 'Trip Expense' && !formData.trip_id) missingFields.push("Trip");
        if (formData.paymentMode === 'Credit' && !formData.shop_id) missingFields.push("Shop");
        if (formData.paymentMode === 'Paid By Driver' && !formData.driver) missingFields.push("Driver");

        if (missingFields.length > 0) {
            alert(`Please fill in the following fields: ${missingFields.join(", ")}`);
            return
        }

        if (formData.paymentMode !== 'Paid By Driver') setFormData(prev=>({...prev, driver : ''}))
        if (formData.paymentMode !== 'Credit') setFormData(prev=>({...prev, shop_id : ''})) 

        if (selected) {
            onSave(formData, selected._id);
        } else {
            onSave(formData);
        }

        onClose();
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '0') {
            handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
        >
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: [0, 0.71, 0.2, 1.01]
                    }}
                    className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
                >
                    <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
                    <div className='flex justify-between gap-2'>
                        {categories &&
                            <div className="mb-4 w-full">
                                <label className="block text-sm font-medium text-gray-700">Select Category</label>
                                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue>{selectedCategory || 'Select Category'}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        }
                        <div className="mb-4 w-full">
                            <label className="block text-sm font-medium text-gray-700">Expense Type</label>
                            <Select value={formData.expenseType} onValueChange={(value) => handleSelectChange('expenseType', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue>{formData.expenseType || 'Select Expense Type'}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {expenseTypes.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex items-center space-x-2 '>
                        <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={new Date(formData.date).toISOString().split('T')[0]}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {selectedCategory !== 'Office Expense' && <div className='flex items-center space-x-2 '>
                        {selectedCategory === 'Trip Expense' && <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Select Trip</label>
                            <Select value={formData.trip_id} defaultValue={formData.trip_id} onValueChange={(value) => handleSelectChange('trip_id', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder='Select Trip' />
                                </SelectTrigger>
                                <SelectContent>
                                    {trips?.map((trip: ITrip) => (
                                        <SelectItem key={trip.trip_id} value={trip.trip_id}>
                                            <div className='flex items-center space-x-2 w-full'>
                                                <span className='font-semibold w-1/2'>{trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}</span>
                                                <div className="flex flex-col items-center space-x-2 w-1/2">
                                                    <span>{statuses[trip.status as number]}</span>
                                                    <div className="relative w-full bg-gray-200 h-1 rounded">
                                                        <div
                                                            className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`}
                                                            style={{ width: `${(trip.status as number / 4) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>}

                        <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Select Truck</label>
                            <Select value={formData.truck} onValueChange={(value) => handleSelectChange('truck', value)}>
                                <SelectTrigger className="w-full text-black" value={formData.truck}>
                                    <SelectValue placeholder='Select Truck' />
                                </SelectTrigger>
                                <SelectContent>
                                    {trucks?.map((truck) => (
                                        <SelectItem key={truck.truckNo} value={truck.truckNo}>
                                            <span>{truck.truckNo}</span>
                                            <span
                                                className={`ml-2 p-1 rounded ${truck.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {truck.status}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                    </div>}

                    <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <div className="flex flex-row w-full justify-start gap-3 mb-3">
                        {paymentModes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`p-2 rounded-md ${formData.paymentMode === type ? 'bg-bottomNavBarColor text-white' : 'bg-lightOrangeButtonColor text-black'}`}
                                onClick={() => handleChange({ target: { name: 'paymentMode', value: type } } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {formData.paymentMode === 'Paid By Driver' && (
                        <DriverSelect
                            drivers={drivers || []}
                            formData={formData}
                            handleChange={handleChange}
                            setFormData={setFormData}
                        />
                    )}

                    {formData.paymentMode === 'Online' && (
                        <div className="mb-4">
                            <input
                                type="text"
                                name="transactionId"
                                value={formData.transactionId}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Transaction ID"
                            />
                        </div>
                    )}

                    {formData.paymentMode === 'Credit' && (
                        <ShopSelect
                            shops={shops} // Pass the shops array as a prop
                            formData={formData}
                            handleChange={handleChange}
                            setFormData={setFormData}
                        />
                    )}

                    {formData.partyBill && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Party Amount</label>
                            <input
                                type="number"
                                name="partyAmount"
                                value={formData.partyAmount}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                            setFormData({
                                id: undefined,
                                trip_id: '',
                                partyBill: false,
                                amount: 0,
                                date: new Date(),
                                expenseType: '',
                                notes: '',
                                partyAmount: 0,
                                paymentMode: 'Cash',
                                transactionId: '',
                                driver: '',
                                truck: '',
                                shop_id: ''
                            })
                            onClose()
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddExpenseModal;
