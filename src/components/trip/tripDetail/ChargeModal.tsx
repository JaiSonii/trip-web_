import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: any;
}

const chargeType = [
  'Detention/Halting Charges',
  'Repair Expense',
  'Loading Charges',
  'Unloading Charges',
  'Union Charges',
  'Weight Charges',
  'Other Charges'
];

const deductionType = [
  'Material Loss',
  'Brokerage',
  'Late Fees',
  'TDS',
  'Mamul',
  'Other'
];

interface TripExpense {
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string;
}

const ChargeModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<TripExpense>({
    trip_id: '',
    partyBill: false,
    amount: 0,
    date: new Date(),
    expenseType: '',
    notes: '',
  });

 


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData({ ...formData, [name]: type === 'checkbox'? !formData.partyBill: value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="modal-class"></div>
    <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01]
          }} className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add New Charge</h2>
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Expense Type</label>
          <div className="relative">
            <select
              name="expenseType"
              value={formData.expenseType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="">Select Expense Type</option>
              {formData.partyBill
                ? chargeType.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                : deductionType.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="h-4 w-4 fill-current text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" />
              </svg>
            </div>
          </div>
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
          <Button variant='outline' onClick={onClose} >
            Cancel
          </Button>
          <Button onClick={handleSave} >
            Save
          </Button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default ChargeModal;
