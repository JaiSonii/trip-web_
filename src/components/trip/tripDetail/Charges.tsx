import React, { useState, useEffect } from 'react';
import ChargeModal from './ChargeModal';
import { ITrip, TripExpense } from '@/utils/interface';
import { MdDelete, MdEdit } from 'react-icons/md';
import EditChargeModal from './EditChargeModal';
import { Button } from '@/components/ui/button';

interface ChargesProps {
  charges: TripExpense[];
  setCharges: React.Dispatch<React.SetStateAction<TripExpense[]>>;
  tripId: string;
  onAddCharge: (charge: TripExpense) => void;
  trip: ITrip;
}

const Charges: React.FC<ChargesProps> = ({ charges, setCharges, tripId, trip }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [sortedCharges, setSortedCharges] = useState<TripExpense[]>([]);
  const [selectedCharge, setSelectedCharge] = useState<TripExpense | null>(null);

  useEffect(() => {
    if (charges) {
      const sorted = [...charges].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSortedCharges(sorted);
    }
  }, [charges]);

  const handleAddCharge = async (newCharge: TripExpense) => {
    const res = await fetch(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCharge),
    });
    const data = await res.json();
    setCharges((prev: TripExpense[]) => [...prev, data.newCharge]);
  };

  const toggleItemExpansion = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const handleEditCharge = (index: number) => {
    setSelectedCharge(sortedCharges[index]);
    setEditModalOpen(true);
  };

  const handleDeleteCharge = async (index: number) => {
    const chargeToDelete = sortedCharges[index];
    const res = await fetch(`/api/trips/${tripId}/expenses/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: chargeToDelete._id }),
    });
    if (res.ok) {
      setCharges((prevCharges: TripExpense[]) => prevCharges.filter((charge, i) => i !== index));
    } else {
      console.error('Failed to delete charge:', chargeToDelete._id);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Charges</h3>
        <Button
          disabled={trip.status === 4}
          className="flex items-center justify-center w-8 h-8 rounded-full focus:outline-none ml-4 transition duration-300 ease-in-out transform hover:scale-110"
          onClick={() => setIsModalOpen(true)}
          aria-label="Add Charge"
        >
          +
        </Button>
      </div>
      {!sortedCharges || sortedCharges.length === 0 ? (
        <p className="text-sm text-gray-500">No charges available.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
          {sortedCharges.map((charge, index) => (
            <div
              key={index}
              className="flex flex-col px-4 py-4 hover:bg-gray-50 transition duration-300 ease-in-out transform hover:scale-105 rounded-lg cursor-pointer"
              onClick={() => toggleItemExpansion(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Amount: ₹{charge.amount}</p>
                  <p className="text-xs text-gray-600">Type: {charge.expenseType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Date: {new Date(charge.date).toLocaleDateString()}</p>
                  <p className={`text-xs font-semibold ${charge.partyBill ? 'text-green-600' : 'text-red-600'}`}>
                    {charge.partyBill ? 'Added to Bill' : 'Reduced from Bill'}
                  </p>
                </div>
              </div>
              {expandedItem === index && (
                <div className="mt-4 bg-gray-100 p-4 rounded-md border border-gray-300">
                  {charge.notes && (
                    <p className="text-xs text-gray-600 mb-2">Notes: {charge.notes}</p>
                  )}
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant={'ghost'}
                      disabled={trip.status === 4}
                      onClick={() => handleEditCharge(index)}
                      className="flex items-center justify-center p-2 hover:bg-gray-200"
                    >
                      <MdEdit size={20} />
                    </Button>
                    <Button
                      variant={'ghost'}
                      disabled={trip.status === 4}
                      onClick={() => handleDeleteCharge(index)}
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
      <ChargeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCharge}
      />
      {editModalOpen && selectedCharge && (
        <EditChargeModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={async (editedCharge: TripExpense) => {
            // Send PATCH request to update charge
            const res = await fetch(`/api/trips/${tripId}/expenses`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(editedCharge),
            });
            if (!res.ok) {
              console.error('Failed to update charge:', selectedCharge._id);
              return;
            }

            // Update charges in state
            const updatedCharges = sortedCharges.map(charge =>
              charge._id === selectedCharge._id ? editedCharge : charge
            );
            setCharges(updatedCharges);

            // Close edit modal
            setEditModalOpen(false);
          }}
          charge={selectedCharge}
        />
      )}
    </div>
  );
};

export default Charges;
