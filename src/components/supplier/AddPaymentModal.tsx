import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import TripAllocationModal from './TripAllocationModal';
import { ISupplierAccount, ITrip } from '@/utils/interface';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payment: ISupplierAccount[]) => void;
    supplierId: string;
}

const AddPaymentModal = ({ isOpen, onClose, onSave, supplierId }: AddPaymentModalProps) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [refNo, setRefNo] = useState('');
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [tripAllocations, setTripAllocations] = useState<Record<string, number>>({});
    const [totalTruckHireCost, setTotalTruckHireCost] = useState<number>(0);
    const [truckHireCosts, setTruckHireCosts] = useState<Record<string, number>>({});
    const [isTripAllocationModalOpen, setIsTripAllocationModalOpen] = useState(false);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await fetch(`/api/suppliers/${supplierId}/payments/trips`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trips');
                }
                const data = await response.json();
                setTrips(data.trips);
                const totalCost = data.trips.reduce((sum: number, trip: ITrip) => trip.truckHireCost ? sum + trip.truckHireCost : sum + 0, 0);
                setTotalTruckHireCost(totalCost);

                // Fetch the truck hire cost for each trip
                const costs: Record<string, number> = {};
                for (const trip of data.trips) {
                    const res = await fetch(`/api/suppliers/${supplierId}/payments/trips/${trip.trip_id}`);
                    const costData = await res.json();
                    costs[trip.trip_id] = trip.truckHireCost - costData.totalAmount;
                }
                setTruckHireCosts(costs);
            } catch (error) {
                console.error(error);
            }
        };

        if (isOpen) {
            fetchTrips();
        }
    }, [isOpen, supplierId]);

    const handleSave = () => {
        // If tripAllocations is empty, create a single payment entry without trip_id
        const payments = Object.entries(tripAllocations).length > 0
            ? Object.entries(tripAllocations).map(([tripId, allocatedAmount]) => ({
                supplier_id: supplierId, // Assign the appropriate supplier_id
                amount: allocatedAmount,
                paymentMode,
                date,
                notes,
                refNo,
                trip_id: tripId || '', // Include trip_id if available
            }))
            : [{
                supplier_id: supplierId, // Assign the appropriate supplier_id
                amount: typeof amount === 'number' ? amount : 0, // Use the entered amount
                paymentMode,
                date,
                notes,
                refNo,
            }];

        // Call onSave with the constructed payments array
        onSave(payments as any);
    };


    const getRefNoLabel = () => {
        switch (paymentMode) {
            case 'online':
                return 'Transaction ID';
            case 'bank transfer':
                return 'Bank Reference Number';
            case 'cheque':
                return 'Cheque Number';
            default:
                return 'Reference Number';
        }
    };

    const openTripAllocationModal = () => {
        if (!amount) return alert('Enter Amount')
        setIsTripAllocationModalOpen(true);
    };

    const handleAllocate = (allocations: Record<string, number>) => {
        setTripAllocations(allocations);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
                <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-xl">
                    <h2 className="text-xl font-bold mb-4">Add Payment</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAmount(value === '' ? '' : Number(value));
                            }}
                            placeholder='Amount'
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Payment Mode</label>
                        <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded border-lightOrange focus:ring focus:ring-lightOrangeButtonColor focus:border-lightOrange focus:outline-none"
                        >
                            <option value="cash">Cash</option>
                            <option value="online">Online</option>
                            <option value="bank transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded"
                            placeholder='Notes'
                        />
                    </div>
                    {paymentMode !== 'cash' && (
                        <div className="mb-4">
                            <label className="block text-gray-700">{getRefNoLabel()}</label>
                            <input
                                type="text"
                                value={refNo}
                                onChange={(e) => setRefNo(e.target.value)}
                                placeholder={getRefNoLabel()}
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <Button onClick={openTripAllocationModal}>Allocate to Trips</Button>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </div>

            <TripAllocationModal
                isOpen={isTripAllocationModalOpen}
                onClose={() => setIsTripAllocationModalOpen(false)}
                trips={trips}
                truckHireCosts={truckHireCosts}
                totalAmount={typeof amount === 'number' ? amount : 0}
                onAllocate={handleAllocate}
            />
        </>
    );
};

export default AddPaymentModal;
