
import Image from 'next/image';
import React from 'react';
import { FaRegCircleUser } from 'react-icons/fa6';
import { IoNotificationsOutline } from "react-icons/io5";
import gstLoadsIcon from '@/assets/gst-banner.png'
import currentlyBuildingIcon from '@/assets/currently-building.png'
import Link from 'next/link';

const Page = () => {
  return (
    <div className='w-full h-full p-4'>
      {/* Truck Animation */}
      <div className='text-black border-b-2 border-gray-400 flex justify-between pb-2'>
        <h1 className='text-2xl font-semibold'>
          Hey!
        </h1>
        <div className='flex items-center gap-4'>
          <IoNotificationsOutline size={30} />

          <Link href={'/user/profile/details'}><FaRegCircleUser size={30} className='font-normal' /></Link>
        </div>

      </div>

      <div className='flex flex-col items-center space-y-4 mt-4'>
        <Image src={gstLoadsIcon} alt='gst banner' width={1024} height={236} priority />
        <Image src={currentlyBuildingIcon} alt='currently banner' width={620} height={260} priority />
        <h3 className='text-[#00638F] font-semibold text-2xl text-center'>
          We are currently building...
        </h3>
        <h3 className='text-[#00638F] text-xl text-center'>
          Will be back soon!
        </h3>
      </div>


    </div>
  );
};

export default Page;
