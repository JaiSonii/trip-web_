import React, { useEffect, useState } from 'react';
import { PaymentBook } from '@/utils/interface';
import { Button } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id: string | undefined
    accountType: string;
    amount: number;
    paymentType: 'Cash' | 'Cheque' | 'Online Transfer';
    receivedByDriver: boolean;
    paymentDate: Date; // Ensure paymentDate is of type Date
    notes?: string;
  }) => void;
  modalTitle: string;
  accountType: string;
  editData?: PaymentBook | null;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  modalTitle,
  accountType,
  editData,
}) => {
  const [formState, setFormState] = useState({
    amount: editData?.amount || 0,
    paymentType: editData?.paymentType || 'Cash' as 'Cash' | 'Cheque' | 'Online Transfer',
    receivedByDriver: editData?.receivedByDriver || false,
    paymentDate: new Date(editData?.paymentDate || Date.now()).toISOString().split('T')[0],
    notes: editData?.notes || ''
  });

  useEffect(() => {
    if (editData) {
      const formattedDate = (editData.paymentDate instanceof Date)
        ? editData.paymentDate.toISOString().split('T')[0]
        : (editData.paymentDate && !isNaN(new Date(editData.paymentDate).getTime()))
          ? new Date(editData.paymentDate).toISOString().split('T')[0]
          : '';
      setFormState({
        amount: editData.amount,
        paymentType: editData.paymentType,
        receivedByDriver: editData.receivedByDriver,
        paymentDate: formattedDate,
        notes: editData.notes || ''
      });
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | any>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editData?._id.toString(),
      accountType,
      amount: formState.amount,
      paymentType: formState.paymentType,
      receivedByDriver: formState.receivedByDriver,
      paymentDate: new Date(formState.paymentDate), // Convert paymentDate string to Date object
      notes: formState.notes,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">{modalTitle}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                name="amount"
                value={formState.amount}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                onFocus={(e) => {
                  if (e.target.value === '0') {
                    e.target.value = '';
                  }
                }}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Payment Type</label>
              <select
                name="paymentType"
                value={formState.paymentType}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="receivedByDriver"
                checked={formState.receivedByDriver}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="block text-sm font-medium text-gray-700">Received By Driver</label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={formState.paymentDate}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formState.notes}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant='outline' type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Modal;
