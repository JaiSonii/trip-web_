import DriverName from '@/components/driver/DriverName';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { MdEdit } from "react-icons/md";

interface TripInfoProps {
  label: string;
  value: string;
  tripId?: string;
  startDate?: Date
}

const TripInfo: React.FC<TripInfoProps> = ({ label, value, tripId, startDate }) => {
  const [notes, setNotes] = useState<string>(''); // State to hold the notes
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  useEffect(() => {
    if (label === 'Notes') {
      setNotes(value); // Initialize notes state with the provided value only once
    }
  }, [label, value]);

  const handleSaveNotes = async () => {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { notes } }),
    });
    if (!res.ok) {
      console.error('Failed to save notes');
    }
    setIsEditingNotes(false); // Save notes and close editing
  };

  return (
    <div className="p-4 border border-lightOrange rounded-lg shadow-lg bg-white w-full hover:shadow-lightOrangeButtonColor transition-shadow duration-300 relative">
      <div className='flex items-center justify-between'>
        <p className="text-sm font-medium text-gray-600 mb-1 tracking-wide uppercase">{label}</p>
        {startDate && (
          <p className="text-sm font-medium text-gray-600 mb-1 tracking-wide uppercase whitespace-nowrap">
            Start Date: {new Date(startDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        {label === 'Notes' && !isEditingNotes ? (
          <div className="" style={{scrollbarWidth : 'thin'}}>
            <textarea disabled className="text-2xl font-semibold text-gray-900 overflow-auto thin-scrollbar " value={notes} />
          </div>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
        {label === 'Notes' && !isEditingNotes && (
          <Button onClick={() => setIsEditingNotes(true)}>
            <MdEdit />
          </Button>
        )}
      </div>

      {/* Conditionally render the modal when editing notes */}
      {isEditingNotes && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0, 0.71, 0.2, 1.01]
            }} className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Notes</h2>
            <textarea
              className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lightOrange"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes..."
              rows={4}
            />
            <div className="flex justify-end mt-4 space-x-4">
              <Button onClick={handleSaveNotes}>Save</Button>
              <Button variant={'outline'} onClick={() => setIsEditingNotes(false)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TripInfo;
