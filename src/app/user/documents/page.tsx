'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaFileContract, FaIdCardAlt, FaLeaf, FaPassport, FaRegCheckCircle, FaRegIdCard, FaRoute, FaShieldAlt, FaTruck, FaUserTie } from 'react-icons/fa';
import { RiSteering2Fill } from 'react-icons/ri';
// import { renderDocument } from '@/components/RenderDocument';
import { FaFolderOpen } from 'react-icons/fa6';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import dynamic from 'next/dynamic';

const RecentDocuments = dynamic(()=>import('@/components/documents/RecentDocuments'),{ssr : false})

const DocumentsPage = () => {
  const [recentDocs, setRecentDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const fetchRecentDocuments = async () => {
    try {
      const res = await fetch(`/api/documents/recent`)
      if (!res.ok) {
        throw new Error('Failed to fetch recent docuemnts')
      }
      const data = await res.json()
      console.log(data)
      if(data.documents.length === 0){
        setError('No recent documents found')
        return
      }
      setRecentDocs(data.documents)
    } catch (error: any) {
      console.log(error)
    }finally{
      setLoading(false)
    }
  }

  const TruckDocArray = [
    {
      title: 'Registration Certificate',
      link: '#',
      icon: <FaRegIdCard className='text-bottomNavBarColor' size={70} /> // Icon representing an ID card or certificate
    },
    {
      title: 'Permit',
      link: '#',
      icon: <FaFileContract className='text-bottomNavBarColor' size={70} /> // Icon representing a legal permit or document
    },
    {
      title: 'Insurance',
      link: '#',
      icon: <FaShieldAlt className='text-bottomNavBarColor' size={70} /> // Icon representing protection or insurance
    },
    {
      title: 'Pollution Certificate',
      link: '#',
      icon: <FaLeaf className='text-bottomNavBarColor' size={70} /> // Icon representing environmental or pollution-related certification
    },
    {
      title: 'Other',
      link: '#',
      icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
    }
  ];

  const DriverDocArray = [
    {
      title: 'License',
      link: '#',
      icon: <FaRegIdCard className='text-bottomNavBarColor' size={70} /> // Icon representing an ID card or certificate
    },
    {
      title: 'Aadhar',
      link: '#',
      icon: <FaIdCardAlt className='text-bottomNavBarColor' size={70} /> // Icon representing a legal permit or document
    },
    {
      title: 'PAN',
      link: '#',
      icon: <FaPassport className='text-bottomNavBarColor' size={70} /> // Icon representing protection or insurance
    },
    {
      title: 'Police Verification',
      link: '#',
      icon: <FaRegCheckCircle className='text-bottomNavBarColor' size={70} /> // Icon representing environmental or pollution-related certification
    },
    {
      title: 'Other',
      link: '#',
      icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
    }
  ];

  useEffect(() => {
    fetchRecentDocuments()
  }, [])

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
              <h1 className="text-center text-xl font-semibold text-buttonTextColor">Lorry Documents</h1>
            </div>
          </div>
        </Link>
      </div>
      <div>
        <div className='border-b-2 border-gray-300 mb-4'>
          <h1 className="text-3xl font-bold text-bottomNavBarColor my-4">Recent Documents</h1>
        </div>
        {loading && <div>{loadingIndicator}</div>}
        {error && <p className='text-red-500'>{error}</p>}
        {recentDocs && <RecentDocuments docs={recentDocs} />}
      </div>
      <div className='mt-4'>
        <div className='border-b-2 border-gray-300 mb-4'>
          <h1 className="text-3xl font-bold text-bottomNavBarColor my-4">Lorry Documents</h1>
        </div>


        <div className="grid grid-cols-5 gap-6">
          {TruckDocArray.map((item: any, index: number) => (
            <Link key={index} href={item.link}>
              <div className="flex flex-col items-center justify-center gap-4 bg-white shadow-lg rounded-lg p-6 transition-all hover:bg-lightOrange transform hover:scale-105 w-48 h-48 ">
                <div className="text-5xl text-bottomNavBarColor">{item.icon}</div>
                <h2 className="text-xl font-semibold text-buttonTextColor text-center">{item.title}</h2>
              </div>
            </Link>

          ))}
        </div>
      </div>

      <div className='mt-4'>
        <div className='border-b-2 border-gray-300 mb-4'>
          <h1 className="text-3xl font-bold text-bottomNavBarColor  my-4">Driver Documents</h1>
        </div>


        <div className="grid grid-cols-5 gap-6">
          {DriverDocArray.map((item: any, index: number) => (
            <Link key={index} href={item.link}>
              <div className="flex flex-col items-center justify-center gap-4 bg-white shadow-lg rounded-lg p-6 transition-all hover:bg-lightOrange transform hover:scale-105 w-48 h-48 ">
                <div className="text-5xl text-bottomNavBarColor">{item.icon}</div>
                <h2 className="text-xl font-semibold text-buttonTextColor text-center">{item.title}</h2>
              </div>
            </Link>

          ))}
        </div>
      </div>

    </div>
  );
};

export default DocumentsPage;
