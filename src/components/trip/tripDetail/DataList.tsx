import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { ITrip, PaymentBook } from '@/utils/interface';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/utilArray';
import { PiPlusBold } from 'react-icons/pi';

interface DataListProps {
  data: PaymentBook[];
  label: string;
  trip: ITrip;
  setData: React.Dispatch<React.SetStateAction<PaymentBook[]>>;
  setTrip: any;
  setBalance: any;
  modalTitle: string;
}

const DataList: React.FC<DataListProps> = ({ data, label, modalTitle, trip, setData, setBalance, setTrip }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<PaymentBook | null>(null);
  const [listData, setListData] = useState<PaymentBook[] >([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    const temp = data.filter((account) => account.accountType === label);
    const sortedData = temp.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setListData(sortedData);
  }, [data, label]);

  const handleAddItem = async (newItem: any) => {
    const itemtosend = {
      ...newItem,
      trip_id : trip.trip_id,
      driver_id : newItem.receivedByDriver ? trip.driver : null
    }
    try {
      const res = await fetch(`/api/parties/${trip.party}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemtosend),
      });
      if (!res.ok) {
        throw new Error('Failed to add new item');
      }
      const resData = await res.json();
      if (resData.status == 400) {
        alert(resData.message);
        return;
      }
      setData((prev) : any=>[
        resData.payment,
        ...prev
      ]);
      setBalance((prev: number) => prev - newItem.amount)
      setIsModalOpen(false);
      // setTrip();
      // router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditItem = async (editedItem: any) => {
    try {
      const res = await fetch(`/api/parties/${trip.party}/payments/${editedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedItem,
          driver_id : editedItem.receivedByDriver === true ? trip.driver : null
        } ),
      });
      if (!res.ok) {
        throw new Error('Failed to edit item');
      }

      const resData = await res.json();

      if (resData.status == 400) {
        alert(resData.message);
        return;
      }

      setData((prev : any)=>prev.map((item : any)=>item._id === resData.payment._id ? resData.payment : item));
      // setTrip((prev: ITrip) => ({
      //   ...prev,
      //   ...resData.trip,
      // }));
      setBalance((prev: number) => {
        if (editData) {
          return prev + editData?.amount as number - editedItem.amount
        } else {
          return prev
        }
      })
      setEditData(null);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteItem = async (item: PaymentBook) => {
    try {
      const res = await fetch(`/api/parties/${trip.party}/payments/${item._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }
      const resData = await res.json();
      setData((prev: PaymentBook[] | any) => {
        const updatedData = prev.filter((acc : any) => acc._id !== item._id);
        console.log('Updated data:', updatedData);
        return updatedData;
      });
      setTrip((prev: ITrip) => ({
        ...prev,
        ...resData.trip
      }));
      setBalance((prev: number) => prev + item.amount)
      // router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const toggleItemExpansion = (index: number) => {
    setExpandedItem((prev) => (prev === index ? null : index));
  };

  const openAddModal = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PaymentBook) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        <Button
          className="rounded-full flex items-center w-8 h-8 p-0"
          onClick={openAddModal}
          aria-label={`Add ${label}`}
          disabled={trip.status == 4}
        >
          <PiPlusBold color='white' size={20} />
        </Button>
      </div>
      {!listData || listData.length === 0 ? (
        <p className="text-sm text-gray-500">No {label.toLowerCase()} available.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
          {listData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col px-4 py-4 hover:bg-gray-50 transition duration-300 ease-in-out transform hover:scale-105 rounded-lg cursor-pointer"
              onClick={() => toggleItemExpansion(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Amount: ₹{formatNumber(item.amount)}</p>
                  <p className="text-xs text-gray-600">{item.paymentType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Date: {new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
              {expandedItem === index && (
                <div className="mt-4 bg-gray-100 p-4 rounded-md border border-gray-300">
                  <p className="text-xs text-gray-600">
                    Received by Driver: {item.driver_id ? 'Yes' : 'No'}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-gray-600 mb-2">Notes: {item.notes}</p>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant={'ghost'}
                      onClick={() => openEditModal(item)}
                      disabled={trip.status == 4}
                      className="flex items-center justify-center p-2 hover:bg-gray-200"
                    >
                      <MdEdit size={20} />
                    </Button>
                    <Button
                      variant={'ghost'}
                      onClick={() => handleDeleteItem(item)}
                      disabled={trip.status == 4}
                      className="flex items-center justify-center p-2 hover:bg-gray-200"
                    >
                      <MdDelete size={20} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleAddItem}
        modalTitle={modalTitle}
        accountType={label}
      />
      {editData && (
        <Modal
          isOpen={!!editData}
          onClose={closeModal}
          onSave={handleEditItem}
          modalTitle="Edit Item"
          accountType={label}
          editData={editData}
        />
      )}
    </div>
  );
};

export default DataList;
