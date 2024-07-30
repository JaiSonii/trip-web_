import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
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
        const payments = Object.entries(tripAllocations).map(([tripId, allocatedAmount]) => ({
            supplier_id: supplierId, // Assign the appropriate supplier_id
            amount: allocatedAmount,
            paymentMode,
            date,
            notes,
            refNo,
            trip_id: tripId, // Include trip_id in the payment object
        }));
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

    const handleAllocationChange = (tripId: string, allocatedAmount: number) => {
        const trip = trips.find(trip => trip.trip_id === tripId);
        if (trip && allocatedAmount > truckHireCosts[tripId]) {
            alert(`Allocated amount cannot exceed the remaining truck hire cost of ${truckHireCosts[tripId]}`);
            return;
        }
        setTripAllocations(prev => ({ ...prev, [tripId]: allocatedAmount }));
    };

    const totalAllocatedAmount = Object.values(tripAllocations).reduce((sum, amount) => sum + (amount || 0), 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl">
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
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Payment Mode</label>
                    <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded"
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
                    />
                </div>
                {paymentMode !== 'cash' && (
                    <div className="mb-4">
                        <label className="block text-gray-700">{getRefNoLabel()}</label>
                        <input
                            type="text"
                            value={refNo}
                            onChange={(e) => setRefNo(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded"
                        />
                    </div>
                )}
                <div className="mb-4">
                    <h3 className="text-gray-700 text-lg font-semibold mb-2">Allocate Amount to Trips</h3>
                    {(amount as number) > totalTruckHireCost ? (
                        <p className="text-red-500">The amount exceeds the total truck hire cost of all trips.</p>
                    ) : (
                        <div className="space-y-2">
                            {trips.map((trip) => (
                                <div key={trip.trip_id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm">
                                    <span className="flex-1 text-gray-700">{trip.route.origin} &rarr; {trip.route.destination}</span>
                                    <input
                                        type="number"
                                        value={tripAllocations[trip.trip_id] || ''}
                                        onChange={(e) => handleAllocationChange(trip.trip_id, Number(e.target.value))}
                                        className="w-32 p-2 border rounded"
                                        placeholder="Amount"
                                        disabled={totalAllocatedAmount >= (amount as number)}
                                    />
                                    <span className="text-gray-700">/{truckHireCosts[trip.trip_id]}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={(amount as number) > totalTruckHireCost}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default AddPaymentModal;
