'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Button } from '@/components/ui/button';

interface ProfitItemProps {
  data: any;
  index: number;
  setOpen?: any;
  setSelectedExpense?: any;
  disabled?: boolean;
  sign: string;
}

const handleSave = async (editedExpense: any) => {
  const sanitizedData = {
    amount: editedExpense.amount,
    expenseType: editedExpense.expenseType,
    paymentDate: new Date(editedExpense.paymentDate),
    paymentType: editedExpense.paymentType,
    receivedByDriver: editedExpense.receivedByDriver,
    notes: editedExpense.notes,
  };

  const res = await fetch(`/api/truckExpense/${editedExpense.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sanitizedData),
  });

  const resData = await res.json();
  console.log(resData);
};

const ProfitItem: React.FC<ProfitItemProps> = ({ data, index, setOpen, setSelectedExpense, disabled, sign }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleDelete = async () => {
    const res = await fetch(`/api/truckExpense/${data._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      router.refresh();
    } else {
      console.log('Failed to delete');
    }
  };

  return (
    <div
      className={`flex items-center justify-between py-2 px-4 bg-lightOrangeButtonColor rounded-lg my-2 cursor-pointer w-full relative transition-transform duration-200 ease-in-out transform ${!disabled ? 'hover:scale-105' : ''} ${isHovered ? 'bg-lightOrange bg-opacity-70' : ''}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      <div className='flex flex-row items-center justify-between w-full'>
        <div className="flex flex-row justify-between w-full">
          <p className="text-sm font-medium text-gray-900">{data.expenseType}</p>
          <p className="text-sm font-semibold text-gray-600">{sign}{data.amount.toFixed(2)}</p>
        </div>
        {isHovered && (
          <div className="flex space-x-2 transition-opacity duration-200 ease-in-out opacity-100">
            <Button
              variant={'ghost'}
              onClick={() => {
                setSelectedExpense(data);
                setOpen(true);
              }}
              className='p-2 transition-opacity duration-200 ease-in-out opacity-100 rounded-full'
            >
              <MdEdit size={20} />
            </Button>
            <Button
              onClick={handleDelete}
              className="p-2 bg-destructive text-white rounded-full transition-colors duration-200 ease-in-out hover:bg-red-600"
            >
              <MdDelete size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfitItem;
