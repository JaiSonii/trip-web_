'use client'
import React from 'react';

import { motion } from 'framer-motion';

const Page = () => {
  return (
    <div className='flex flex-col items-center justify-center'>
      {/* Truck Animation */}
      <motion.div
        initial={{ x: '-100vw' }}  // Start from off-screen left
        animate={{ x: 0 }}         // Move to the center
        transition={{ type: 'spring', stiffness: 60, damping: 25 }} // Slow down as it reaches center
        className='mr-6 px-5'
      >
        <iframe
          src="https://lottie.host/embed/3d45f054-61ac-4d4e-837c-2fa3006e28cc/MeZ8JDXVB5.json"
        ></iframe>
      </motion.div>

      {/* Fade-in text after truck reaches center */}
      <motion.p
        initial={{ opacity: 0 }}  // Start with invisible text
        animate={{ opacity: 1 }}  // Fade-in text
        transition={{ duration: 1, delay: 1.5 }}  // Delay to match truck animation
        className='text-gray-500 text-lg font-semibold text-center -top-10'
      >
        Currently Building...
      </motion.p>
    </div>
  );
};

export default Page;
