import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { trip } = useTrip();
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`p-4 border border-lightOrange rounded-lg shadow-lg bg-white w-full hover:shadow-lightOrangeButtonColor transition-all duration-300 relative ${label === 'Driver' ? 'h-full' : ''}`}
    >
      <motion.div className='flex flex-col space-y-2' variants={itemVariants}>
        <div className='flex items-center justify-between'>
          <motion.p 
            variants={itemVariants}
            className="text-sm font-medium text-gray-600 tracking-wide uppercase"
          >
            {label}
          </motion.p>
          {(startDate || validityDate) && (
            <motion.div 
              variants={itemVariants}
              className="flex flex-col items-end text-xs text-gray-500"
            >
              {startDate && (
                <span>START DATE: {formatDate(startDate)}</span>
              )}
              {validityDate && (
                <span className='flex gap-1'>E-WAY BILL VALIDITY: {ewbColor(trip)}</span>
              )}
            </motion.div>
          )}
        </div>
        <div className="flex items-center justify-between">
          {label === 'Notes' && !isEditingNotes ? (
            <motion.div 
              variants={itemVariants}
              className="w-full pr-4" 
              style={{ scrollbarWidth: 'thin' }}
            >
              <textarea
                disabled
                className="w-full text-lg font-semibold text-gray-900 overflow-auto thin-scrollbar resize-none bg-transparent"
                value={notes}
              />
            </motion.div>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="flex flex-col"
            >
              <p className="text-xl font-semibold text-gray-900">{value}</p>
              {supplierId && supplierName && (
                <Link 
                  onClick={(e) => e.stopPropagation()}  
                  href={`/user/suppliers/${supplierId}/trips`} 
                  className="text-xs text-gray-800 hover:scale-105 hover:underline transition-all duration-300 ease-in-out"
                >
                  {supplierName}
                </Link>
              )}
            </motion.div>
          )}
          {label === 'Notes' && !isEditingNotes && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button onClick={() => setIsEditingNotes(true)} size="sm" variant="ghost">
                <MdEdit />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditingNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                y: 20,
                transition: {
                  duration: 0.2
                }
              }}
              className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg"
            >
              <h2 className="text-xl font-bold mb-4">Edit Notes</h2>
              <textarea
                className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lightOrange transition-all duration-300"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes..."
                rows={4}
              />
              <div className="flex justify-end mt-4 space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleSaveNotes}>Save</Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => setIsEditingNotes(false)}>Cancel</Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TripInfo;

