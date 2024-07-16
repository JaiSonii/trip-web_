'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MdDelete, MdEdit } from 'react-icons/md'

interface ProfitItemProps {
  data: any
  index: number
  setOpen?: any
  setSelectedExpense? : any
  disabled? : boolean
  sign : string
}

const handleSave = async (editedExpense: any) => {
  const sanitizedData = {
    amount: editedExpense.amount,
    expenseType: editedExpense.expenseType,
    paymentDate: new Date(editedExpense.paymentDate),
    paymentType: editedExpense.paymentType,
    receivedByDriver: editedExpense.receivedByDriver,
    notes: editedExpense.notes,
  }

  const res = await fetch(`/api/truckExpense/${editedExpense.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sanitizedData),
  });

  const resData = await res.json();
  console.log(resData);
}

const ProfitItem: React.FC<ProfitItemProps> = ({ data, index, setOpen , setSelectedExpense, disabled, sign}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleModalClose = () => {
    setOpen(false);
    router.refresh();
  }

  const handleDelete = async () => {
    const res = await fetch(`/api/truckExpense/${data._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (res.ok) {
      router.refresh();
    } else {
      console.log('Failed to delete');
    }
  }

  return (
    <div 
      className={`flex items-center justify-between py-2 px-4 bg-red-50 rounded-lg my-2 cursor-pointer w-full relative transition-transform duration-200 ease-in-out transform hover:scale-105 ${isHovered ? 'bg-black bg-opacity-40' : ''}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      <div className='flex flex-row items-center justify-between w-full'>
        <p className="text-sm font-medium text-gray-900">{data.expenseType}</p>
        <p className="text-xs text-gray-600">{sign}{data.amount.toFixed(2)}</p>
      </div>
      {isHovered && (
        <div className="absolute right-4 top-2 flex space-x-2 transition-opacity duration-200 ease-in-out opacity-100">
          <button
            onClick={() =>{
              setSelectedExpense(data)
              setOpen(true)
            } }
            className="text-xs text-white py-1 px-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md shadow-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <MdEdit />
          </button>
          <button
            onClick={handleDelete}
            className="text-xs bg-red-500 text-white py-1 px-2 rounded transition-colors duration-200 ease-in-out hover:bg-red-600"
          >
            <MdDelete />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfitItem;
