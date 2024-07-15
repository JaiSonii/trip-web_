import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Adjust import path as per your project
import { chargeType, deductionType } from '@/utils/utilArray';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: any;
}

const combinedChargeTypes = [
  ...chargeType,
  ...deductionType
];

interface TripExpense {
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string;
}

const ExpenseModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<TripExpense>({
    trip_id: '',
    partyBill: true,
    amount: 0,
    date: new Date(),
    expenseType: '',
    notes: '',
  });

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, expenseType: value });
  };

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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
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
            <Select
              value={formData.expenseType}
              onValueChange={(value : any) => handleSelectChange(value)}
              defaultValue="Select Expense Type"
            >
              <SelectTrigger className="w-full">
                <SelectValue>{formData.expenseType || 'Select Expense Type'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={formData.expenseType}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {combinedChargeTypes.map((type) => (
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end">
            <button onClick={onClose} className="mr-2 p-2 bg-gray-300 rounded-md">
              Cancel
            </button>
            <button onClick={handleSave} className="p-2 bg-blue-500 text-white rounded-md">
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseModal;
