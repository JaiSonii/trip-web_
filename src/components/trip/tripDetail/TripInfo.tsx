import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { MdEdit } from "react-icons/md";

interface TripInfoProps {
  label: string;
  value: string;
  tripId?: string;
}

const TripInfo: React.FC<TripInfoProps> = ({ label, value, tripId }) => {
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
      <p className="text-sm font-medium text-gray-600 mb-1 tracking-wide uppercase">{label}</p>
      <div className="flex items-center justify-between mb-2">
        {label === 'Notes' && !isEditingNotes ? (
          <div className="flex-1">
            <p className="text-2xl font-semibold text-gray-900 overflow-hidden overflow-ellipsis whitespace-pre-wrap">
              {notes}
            </p>
          </div>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
        {label === 'Notes' && !isEditingNotes && (
          <Button
            
            onClick={() => setIsEditingNotes(true)}
          >
            <MdEdit />
          </Button>
        )}
      </div>
      {label === 'Notes' && isEditingNotes && (
        <div className="mt-2">
          <textarea
            className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes..."
            rows={4}
          />
          <div className="flex justify-end mt-4 space-x-4">
            <Button
              
              onClick={handleSaveNotes}
            >
              Save
            </Button>
            <Button
              variant={'outline'}
              onClick={() => setIsEditingNotes(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripInfo;
