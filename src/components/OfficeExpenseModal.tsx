'use client'
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { officeExpenseTypes } from '@/utils/utilArray';
import { motion } from 'framer-motion';
import ShopSelect from './shopkhata/ShopSelect';

interface ChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: any;
    selected?: any
    shops : any[]
}


const OfficeExpenseModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSave, selected, shops }) => {
    const [formData, setFormData] = useState<any>({
        amount: selected?.amount || 0,
        date: new Date(selected?.date || Date.now()),
        expenseType: selected?.expenseType || '',
        notes: selected?.notes || '',
        paymentMode: selected?.paymentMode || 'Cash',
        transactionId: selected?.transactionId || '',
        shop_id : selected?.shop_id || ''
    });

    useEffect(() => {
        if (selected) {
            setFormData({
                amount: selected.amount || 0,
                date: new Date(selected.date),
                expenseType: selected.expenseType || '',
                notes: selected.notes || '',
                paymentMode: selected.paymentMode || 'Cash',
                transactionId: selected.transactionId || '',
                shop_id : selected?.shop_id || ''
            });
        }
    }, [selected])

    useEffect(()=>{
        if(formData.paymentMode !== 'Credit'){
            setFormData({...formData, shop_id: ''})
        }
    },[formData.paymentMode])


    const handleSelectChange = (value: string) => {
        setFormData((prevData: any) => {
            return {
                ...prevData,
                expenseType: value,
            }
        });
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? !formData.partyBill : value });
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
                    <h2 className="text-xl font-semibold mb-4">Add New Charge</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Expense Type</label>
                        <Select value={formData.expenseType} onValueChange={handleSelectChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue>{formData.expenseType || 'Select Expense Type'}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {officeExpenseTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                    <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <div className="flex flex-row w-full justify-start gap-3 mb-3">
                        {['Cash', 'Online', 'Credit'].map((type) => (
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
                </motion.div>
            </div>
        </div>
    );
};

export default OfficeExpenseModal;
