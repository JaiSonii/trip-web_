'use client'
import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'next/navigation';
import RecentDocuments from '@/components/documents/RecentDocuments';
import { useTrip } from '@/context/tripContext';

const Page = () => {

  const {trip, setTrip, loading} = useTrip()

  return (
    <div className='mx-auto p-4'>
      {/* Truck Animation */}
      <RecentDocuments docs={trip.documents} />
      
    </div>
  );
};

export default Page;
