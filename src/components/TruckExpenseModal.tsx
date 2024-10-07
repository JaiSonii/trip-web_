'use client'
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fuelAndDriverChargeTypes, maintenanceChargeTypes } from '@/utils/utilArray';
import { IDriver, IExpense, ITrip, TruckModel } from '@/utils/interface';
import DriverSelect from './trip/DriverSelect';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { statuses } from '@/utils/schema';
import ShopSelect from './shopkhata/ShopSelect';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: any;
  driverId: string;
  trucks : TruckModel[]
  drivers : IDriver[]
  shops : any[]
  selected?: any;
  truckPage?: boolean;
}

interface TripExpense {
  id?: string;
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
  shop_id?: string;
}

const TruckExpenseModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSave, driverId, selected, truckPage, trucks, drivers , shops}) => {
  const [formData, setFormData] = useState<TripExpense>({
    id: selected?._id || undefined,
    partyBill: false,
    amount: selected?.amount || 0,
    date: selected?.date ? new Date(selected.date) : new Date(),
    expenseType: selected?.expenseType || '',
    notes: selected?.notes || '',
    partyAmount: 0,
    paymentMode: selected?.paymentMode || 'Cash',
    transactionId: selected?.transaction_id || '',
    driver: driverId || '',
    truck: selected?.truck || '',
    shop_id: selected?.shop_id || ''
  });

  const pathname = usePathname()

  const [driverName, setDriverName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fuel & Driver');

  useEffect(() => {
    if (!selected) return;
    setFormData({
      id: selected?._id || undefined,
      partyBill: false,
      amount: selected?.amount || 0,
      date: selected?.date ? new Date(selected.date) : new Date(),
      expenseType: selected?.expenseType || '',
      notes: selected?.notes || '',
      partyAmount: 0,
      paymentMode: selected?.paymentMode || 'Cash',
      transactionId: selected?.transaction_id || '',
      driver: selected?.driver || '',
      truck: selected?.truck || '',
      shop_id: selected?.shop_id || ''
    });
  }, [selected]);


  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: value };

      return updatedData;
    });
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (formData.paymentMode === 'Paid By Driver') {
      setFormData((prev) => ({ ...prev, driver: driverId }));
    }
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

  const chargeTypes = selectedCategory === 'Fuel & Driver' ? Array.from(fuelAndDriverChargeTypes) : Array.from(maintenanceChargeTypes);

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
          <h2 className="text-xl font-semibold mb-4">Truck Expense</h2>

          <div className="flex space-x-4 mb-4 border-b-2 border-gray-200">
            <Button
              variant="link"
              onClick={() => setSelectedCategory('Fuel & Driver')}
              className={`px-4 py-2 transition duration-300 ease-in-out ${selectedCategory === 'Fuel & Driver'
                ? 'border-b-2 border-bottomNavBarColor text-bottomNavBarColor'
                : 'border-transparent text-gray-600 hover:text-bottomNavBarColor hover:border-bottomNavBarColor'
                }`}
            >
              Fuel & Driver
            </Button>
            <Button
              variant="link"
              onClick={() => setSelectedCategory('Maintenance')}
              className={`px-4 py-2 transition duration-300 ease-in-out ${selectedCategory === 'Maintenance'
                ? 'border-b-2 border-bottomNavBarColor text-bottomNavBarColor'
                : 'border-transparent text-gray-600 hover:text-bottomNavBarColor hover:border-bottomNavBarColor'
                }`}
            >
              Maintenance
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Expense Type</label>
            <Select value={formData.expenseType} onValueChange={(value) => handleSelectChange('expenseType', value)}>
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
                value={formData.date.toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>



          <div className="mb-4 w-1/2">
            <label className="block text-sm font-medium text-gray-700">Select Truck</label>
            <Select value={formData.truck} onValueChange={(value) => handleSelectChange('truck', value)}>
              <SelectTrigger className="w-full text-black" value={formData.truck}>
                <SelectValue placeholder='Select Truck' />
              </SelectTrigger>
              <SelectContent>
                {trucks.map((truck) => (
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

          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <div className="flex flex-row w-full justify-start gap-3 mb-3">
            {['Cash', 'Paid By Driver', 'Online','Credit'].map((type) => (
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

          {formData.paymentMode === 'Paid By Driver' && !truckPage && (
            <div className="mb-4">
              <button disabled className="block text-sm font-medium text-gray-700 border border-black rounded-md p-2 w-1/3">
                {driverName}
              </button>
            </div>
          )}

          {formData.paymentMode === 'Paid By Driver' && truckPage && (
            <DriverSelect
              drivers={drivers}
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

          {(formData.expenseType !== 'Fuel Expense' && !selected && !truckPage && !pathname.includes('expenses')) && (
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

export default TruckExpenseModal;
