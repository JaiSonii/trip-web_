'use client'

import React, { useState } from 'react';
import { IDriver } from '@/utils/interface';
import { v4 as uuidv4 } from 'uuid';
import { Button } from './ui/button';

interface Props {
  onSubmit: (driver: IDriver) => void;
}

const DriverForm: React.FC<Props> = ({ onSubmit }) => {
  // State to hold form data
  const [formData, setFormData] = useState<Partial<IDriver>>({
    name: '',
    contactNumber: '',
    balance: 0,
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Handle input changes and update the state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Generate a unique driver ID
    const driverId = 'driver' + uuidv4();
    // Create a new driver object
    const newDriver: IDriver = {
      ...formData,
      status: 'Available',
      driver_id: driverId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IDriver; // Type assertion to ensure newDriver matches IDriver
    // Call onSubmit with the new driver object
    onSubmit(newDriver);
    // Optionally, clear the form after submission
    setFormData({
      name: '',
      contactNumber: '',
      balance: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-md text-black">
      <label className="block mb-2">
        Name*
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        Contact Number
        <input
          type="text"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <Button type="submit" className='w-full justify-center'>
        Submit
      </Button>
    </form>
  );
};

export default DriverForm;
