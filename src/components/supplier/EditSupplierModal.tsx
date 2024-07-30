import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ISupplier } from '@/utils/interface';

interface EditSupplierModalProps {
    supplier: ISupplier;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedSupplier: ISupplier) => void;
}

const EditSupplierModal = ({ supplier, isOpen, onClose, onSave }: EditSupplierModalProps) => {
    const [name, setName] = useState(supplier.name);
    const [contactNumber, setContactNumber] = useState(supplier.contactNumber);

    const handleSave = () => {
        const updatedSupplier = { ...supplier, name, contactNumber };
        onSave(updatedSupplier as any);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Supplier</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Contact Number</label>
                    <input
                        type="text"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant={'ghost'} onClick={onClose}>Cancel</Button>
                    <Button  onClick={handleSave}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default EditSupplierModal;
