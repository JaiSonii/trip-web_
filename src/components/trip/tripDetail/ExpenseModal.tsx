'use client'
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Adjust import path as per your project
import { Button } from '@/components/ui/button';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: any;
  driverId: string;
  selected?: any;
  truckPage?: boolean
}

const fuelAndDriverChargeTypes = [
  'Brokerage',
  'Detention',
  'Driver bhatta',
  'Driver payment',
  'Loading charges',
  'Fuel Expense',
  'Other',
  'Police Expense',
  'RTO Expense',
  'Toll Expense',
  'Union Expense',
  'Weight Charges',
  'Unloading Charges',
];

const maintenanceChargeTypes = [
  'Repair Expense',
  'Showroom Service',
  'Regular Service',
  'Minor Repair',
  'Gear Maintenance',
  'Brake Oil Change',
  'Grease Oil Change',
  'Spare Parts Purchase',
  'Air Filter Change',
  'Tyre Puncture',
  'Tyre Retread',
  'Tyre Purchase',
  'Roof Top Repair'
];

interface TripExpense {
  id?: string;
  trip: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string;
  partyAmount: number;
  paymentMode: string;
  transactionId: string;
  driver: string;
}

const ExpenseModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSave, driverId, selected, truckPage }) => {

  const [formData, setFormData] = useState<TripExpense>({
    id: selected?._id || undefined,
    trip: selected?.trip_id || '',
    partyBill: false,
    amount: selected?.amount || 0,
    date: selected?.date ? new Date(selected.date) : new Date(),
    expenseType: selected?.expenseType || '',
    notes: selected?.notes || '',
    partyAmount: 0,
    paymentMode: 'Cash',
    transactionId: '',
    driver: ''
  });

  const [driverName, setDriverName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fuel & Driver');

  useEffect(() => {
    if (!selected) return;
    setFormData(() => {
      return {
        id: selected?._id || undefined,
        trip: selected?.trip_id || '',
        partyBill: false,
        amount: selected?.amount || 0,
        date: selected?.date ? new Date(selected.date) : new Date(),
        expenseType: selected?.expenseType || '',
        notes: selected?.notes || '',
        partyAmount: 0,
        paymentMode: 'Cash',
        transactionId: '',
        driver: ''
      }
    })
  }, [selected])

  useEffect(() => {
    const fetchDriverName = async () => {
      const result = await fetch(`/api/drivers/${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await result.json();
      setDriverName(data.name || 'Driver Not Found');
    };
    if (formData.paymentMode === 'Paid By Driver') fetchDriverName();
  }, [formData.paymentMode, driverId]);

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, expenseType: value });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? !formData.partyBill : value });
  };

  const handleSave = () => {
    if (formData.paymentMode === 'Paid By Driver') {
      setFormData((prev) => ({ ...prev, driver: driverId }));
    }
    if (selected) {
      onSave(formData, selected._id)
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

  const chargeTypes = selectedCategory === 'Fuel & Driver' ? fuelAndDriverChargeTypes : maintenanceChargeTypes;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Add New Charge</h2>

          <div className="flex space-x-4 mb-4 border-b-2 border-gray-200">
            <Button
              variant={'link'}
              onClick={() => setSelectedCategory('Fuel & Driver')}
              className={`px-4 py-2 transition duration-300 ease-in-out ${selectedCategory === 'Fuel & Driver'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500'
                }`}
            >
              Fuel & Driver
            </Button>
            {truckPage &&
              <Button
                variant={'link'}
                onClick={() => setSelectedCategory('Maintenance')}
                className={`px-4 py-2 transition duration-300 ease-in-out ${selectedCategory === 'Maintenance'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500'
                  }`}
              >
                Maintenance
              </Button>
            }

          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Expense Type</label>
            <Select value={formData.expenseType} onValueChange={handleSelectChange}>
              <SelectTrigger className="w-full">
                <SelectValue>{formData.expenseType || 'Select Expense Type'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {chargeTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <div className="flex flex-row w-full justify-start gap-3 mb-3">
            {['Cash', 'Paid By Driver', 'Online'].map((type) => (
              <button
                key={type}
                type="button"
                className={`p-2 rounded-md ${formData.paymentMode === type ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
                onClick={() => handleChange({ target: { name: 'paymentMode', value: type } } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)}
              >
                {type}
              </button>
            ))}
          </div>

          {formData.paymentMode === 'Paid By Driver' &&
            <div className="mb-4">
              <button disabled className="block text-sm font-medium text-gray-700 border border-black rounded-md p-2 w-1/3">
                {driverName}
              </button>
            </div>
          }

          {formData.paymentMode === 'Online' &&
            <div className="mb-4">
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder='Transaction ID'
              />
            </div>
          }

          {(formData.expenseType !== 'Fuel Expense' && !selected && !truckPage)  &&
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Add to Party Bill</label>
              <input
                type="checkbox"
                name="partyBill"
                checked={formData.partyBill}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
          }

          {formData.partyBill &&
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
          }

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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseModal;
