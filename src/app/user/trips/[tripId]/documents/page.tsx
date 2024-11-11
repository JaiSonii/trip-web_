'use client'
import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'next/navigation';
import RecentDocuments from '@/components/documents/RecentDocuments';
import { useTrip } from '@/context/tripContext';
import { Button } from '@/components/ui/button';
import TripDocumentUpload from '@/components/documents/TripDocumentUpload';
import { Frown } from 'lucide-react';

const Page = () => {
  const {tripId} = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const {trip, setTrip, loading} = useTrip()

  if(!trip){
    return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Trip Not Found</div>
  }

  return (
    <div className='mx-auto p-4'>
      <div className='flex justify-end my-2'>
      <Button onClick={()=>setIsOpen(true)}>Upload Document</Button>
      </div>
      
      {/* Truck Animation */}
      <RecentDocuments docs={trip?.documents || []} />
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <TripDocumentUpload open={isOpen} setOpen={setIsOpen} tripId={tripId as string} setTrip={setTrip}/>
        </div>
      )}
    </div>
  );
};

export default Page;
