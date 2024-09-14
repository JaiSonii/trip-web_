'use client'
import Link from 'next/link';
import React, { useEffect } from 'react';
import { FaRoute, FaTruck, FaUserTie } from 'react-icons/fa';
import { RiSteering2Fill } from 'react-icons/ri';

const DocumentsPage = () => {

  const fetchRecentDocuments = async()=>{
    try {
      const res = await fetch(`/api/documents/recent`)
      if(!res.ok){
        throw new Error('Failed to fetch recent docuemnts')
      }
      const data = await res.json()
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    fetchRecentDocuments()
  },[])

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
      <h1 className="text-3xl font-bold text-bottomNavBarColor">Documents Repository</h1></div>
      
      <div className="flex items-center gap-4">
        <Link href={`/user/documents/tripDocuments`}>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer">
          <div className="flex flex-col items-center">
            <FaRoute className="text-bottomNavBarColor mb-4" size={70} />
            <h1 className="text-center text-xl font-semibold text-buttonTextColor">Trip Documents</h1>
          </div>
        </div>
        </Link>
        <Link href={`/user/documents/driverDocuments`}>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer">
          <div className="flex flex-col items-center">
            <RiSteering2Fill className="text-bottomNavBarColor mb-4" size={70} />
            <h1 className="text-center text-xl font-semibold text-buttonTextColor">Driver Documents</h1>
          </div>
        </div>
        </Link>
        <Link href={`/user/documents/truckDocuments`}>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer">
          <div className="flex flex-col items-center">
            <FaTruck className="text-bottomNavBarColor mb-4" size={70} />
            <h1 className="text-center text-xl font-semibold text-buttonTextColor">Truck Documents</h1>
          </div>
        </div>
        </Link>
      </div>
    </div>
  );
};

export default DocumentsPage;
