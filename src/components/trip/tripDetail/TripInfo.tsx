import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MdEdit } from "react-icons/md";
import Link from 'next/link';
import { useTrip } from '@/context/tripContext';
import { ewbColor } from '@/utils/EwayBillColor';

interface TripInfoProps {
  label: string;
  value: string;
  tripId?: string;
  startDate?: Date;
  validityDate?: Date | null;
  supplierId?: string;
  supplierName?: string;
}

const TripInfo: React.FC<TripInfoProps> = ({ label, value, tripId, startDate, validityDate, supplierId, supplierName }) => {
  const {trip} = useTrip()
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);


  useEffect(() => {
    if (label === 'Notes') {
      setNotes(value);
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
    setIsEditingNotes(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  return (
    <div className={`p-4 border border-lightOrange rounded-lg shadow-lg bg-white w-full hover:shadow-lightOrangeButtonColor transition-shadow duration-300 relative ${label === 'Driver' ? 'h-full' : ''}`}>
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center justify-between'>
          <p className="text-sm font-medium text-gray-600 tracking-wide uppercase">{label}</p>
          {(startDate || validityDate) && (
            <div className="flex flex-col items-end text-xs text-gray-500">
              {startDate && (
                <span>START DATE :  {formatDate(startDate)}</span>
              )}
              {validityDate && (
                <span className='flex gap-1'>E-WAY BILL VALIDITY :  {ewbColor(trip)}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          {label === 'Notes' && !isEditingNotes ? (
            <div className="w-full pr-4" style={{ scrollbarWidth: 'thin' }}>
              <textarea
                disabled
                className="w-full text-lg font-semibold text-gray-900 overflow-auto thin-scrollbar resize-none bg-transparent"
                value={notes}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-gray-900">{value}</p>
              {supplierId && supplierName && (
               <Link onClick={(e)=>e.stopPropagation()}  href={`/user/suppliers/${supplierId}/trips`} className="text-xs text-gray-800 hover:scale-105 hover:underline transition-all duration-300 ease-in-out">{supplierName}</Link>
              )}
            </div>
          )}
          {label === 'Notes' && !isEditingNotes && (
            <Button onClick={() => setIsEditingNotes(true)} size="sm" variant="ghost">
              <MdEdit />
            </Button>
          )}
        </div>
      </div>

      {isEditingNotes && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0, 0.71, 0.2, 1.01]
            }}
            className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg"
          >
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
              <Button variant="outline" onClick={() => setIsEditingNotes(false)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TripInfo;