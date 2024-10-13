'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaFileAlt, FaFileContract, FaIdCardAlt, FaLeaf, FaPassport, FaRegCheckCircle, FaRegIdCard, FaRoute, FaShieldAlt, FaTruck, FaTruckLoading, FaUserTie } from 'react-icons/fa';
import { RiSteering2Fill } from 'react-icons/ri';
// import { renderDocument } from '@/components/RenderDocument';
import { FaFileInvoice, FaFolderOpen } from 'react-icons/fa6';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import dynamic from 'next/dynamic';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { RiTruckLine } from "react-icons/ri";
import { PiSteeringWheel } from "react-icons/pi";
import { GoOrganization } from 'react-icons/go';

const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false })

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
      if (data.documents.length === 0) {
        setError('No recent documents found')
        return
      }
      setRecentDocs(data.documents)
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }






  const documentTypes = [
    {
      title: 'Trip Documents',
      link: '/user/documents/tripDocuments',
      icon: <FaRoute className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Driver Documents',
      link: '/user/documents/driverDocuments',
      icon: <PiSteeringWheel className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Lorry Documents',
      link: '/user/documents/truckDocuments',
      icon: <RiTruckLine className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Company Documents',
      link: '#',
      icon: <GoOrganization className='text-bottomNavBarColor' size={40} />
    }
  ]

  useEffect(() => {
    fetchRecentDocuments()
  }, [])

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black">Documents</h1></div>

      <div className="grid grid-cols-4 gap-4 border-b-2 border-gray-300 py-4">
        {documentTypes.map((type) => (
          <Link href={type.link} key={type.title}>
            <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer">
              <div className="flex flex-col items-start">
                {type.icon}
                <h1 className="text-left text-lg font-semibold text-black mt-4">{type.title}</h1>
                <p className='text-gray-400'>x files</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className=' mb-2'>
          <h1 className="text-xl text-black font-semibold my-4">Recently Uploaded</h1>
        </div>
        {loading && <div>{loadingIndicator}</div>}
        {error && <p className='text-red-500'>{error}</p>}
        {recentDocs && <RecentDocuments docs={recentDocs} />}
      </div>

      {/* Trip Docs */}

      {/* <div className='mt-4'>
        <div className='border-b-2 border-gray-300 mb-4'>
          <h1 className="text-3xl font-bold text-bottomNavBarColor  my-4">Trip Documents</h1>
        </div>
        <div className="grid grid-cols-5 gap-6">
          {TripDocArray.map((item: any, index: number) => (
            <Link key={index} href={item.link}>
              <div className="flex flex-col items-center justify-center gap-4 bg-white shadow-lg rounded-lg p-6 transition-all hover:bg-lightOrange transform hover:scale-105 w-48 h-48 ">
                <div className="text-5xl text-bottomNavBarColor">{item.icon}</div>
                <h2 className="text-xl font-semibold text-buttonTextColor text-center">{item.title}</h2>
              </div>
            </Link>

          ))}
        </div>
      </div> */}

      {/* {Lorry Docs} */}



      {/* Driver Docs */}
      {/* <div className='mt-4'>
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
      </div> */}
    </div>
  );
};

export default DocumentsPage;
