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
      console.log(data)
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

  const TruckDocArray = [
    {
      title: 'Registration Certificate',
      link: {
        pathname: '/user/documents/truckDocuments',
        query: { type: 'Registration Certificate' }
      },
      icon: <FaRegIdCard className='text-bottomNavBarColor' size={70} /> // Icon representing an ID card or certificate
    },
    {
      title: 'Permit',
      link: {
        pathname: '/user/documents/truckDocuments',
        query: { type: 'Permit' }
      },
      icon: <FaFileContract className='text-bottomNavBarColor' size={70} /> // Icon representing a legal permit or document
    },
    {
      title: 'Insurance',
      link: {
        pathname: '/user/documents/truckDocuments',
        query: { type: 'Insurance' }
      },
      icon: <FaShieldAlt className='text-bottomNavBarColor' size={70} /> // Icon representing protection or insurance
    },
    {
      title: 'Pollution Certificate',
      link: {
        pathname: '/user/documents/truckDocuments',
        query: { type: 'Pollution Certificate' }
      },
      icon: <FaLeaf className='text-bottomNavBarColor' size={70} /> // Icon representing environmental or pollution-related certification
    },
    {
      title: 'Fitness Certificate',
      link: {
        pathname: '/user/documents/truckDocuments',
        query: { type: 'Fitness Certificate' }
      },
      icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
    },
    {
      title: 'Other',
      link: {
        pathname: '/user/documents/truckDocuments',
        query: { type: 'Other' }
      },
      icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
    },

  ];

  const DriverDocArray = [
    {
      title: 'License',
      link: {
        pathname: '/user/documents/driverDocuments',
        query: { type: 'License' }
      },
      icon: <FaRegIdCard className='text-bottomNavBarColor' size={70} /> // Icon representing an ID card or certificate
    },
    {
      title: 'Aadhar',
      link: {
        pathname: '/user/documents/driverDocuments',
        query: { type: 'Aadhar' }
      },
      icon: <FaIdCardAlt className='text-bottomNavBarColor' size={70} /> // Icon representing a legal permit or document
    },
    {
      title: 'PAN',
      link: {
        pathname: '/user/documents/driverDocuments',
        query: { type: 'PAN' }
      },
      icon: <FaPassport className='text-bottomNavBarColor' size={70} /> // Icon representing protection or insurance
    },
    {
      title: 'Police Verification',
      link: {
        pathname: '/user/documents/driverDocuments',
        query: { type: 'Police Verification' }
      },
      icon: <FaRegCheckCircle className='text-bottomNavBarColor' size={70} /> // Icon representing environmental or pollution-related certification
    },
    {
      title: 'Other',
      link: {
        pathname: '/user/documents/driverDocuments',
        query: { type: 'Other' }
      },
      icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
    }
  ];

  const TripDocArray = [
    {
      title: 'E-Way Bill',
      link: {
        pathname: '/user/documents/tripDocuments',
        query: { type: 'E-Way Bill' }
      },
      icon: <FaFileInvoice className="text-bottomNavBarColor" size={70} /> // Icon representing an invoice-like document for E-Way Bill
    },
    {
      title: 'POD',
      link: {
        pathname: '/user/documents/tripDocuments',
        query: { type: 'POD' }
      },
      icon: <FaFileContract className="text-bottomNavBarColor" size={70} /> // Icon representing proof of delivery (contract-like document)
    },
    {
      title: 'Bilty',
      link: {
        pathname: '/user/documents/tripDocuments',
        query: { type: 'Bilty' }
      },
      icon: <FaTruckLoading className="text-bottomNavBarColor" size={70} /> // Icon representing a truck loading document (Bilty)
    },
    {
      title: 'FM/Challan',
      link: {
        pathname: '/user/documents/tripDocuments',
        query: { type: 'FM/Challan' }
      },
      icon: <FaFileAlt className="text-bottomNavBarColor" size={70} /> // Icon representing a general form or challan
    },
    {
      title: 'Other',
      link: {
        pathname: '/user/documents/tripDocuments',
        query: { type: 'Other' }
      },
      icon: <FaFolderOpen className="text-bottomNavBarColor" size={70} /> // Folder icon for "Other" category
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

    {/* Trip Docs */}

      <div className='mt-4'>
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
      </div>

          {/* {Lorry Docs} */}

      <div className='mt-4'>
        <div className='border-b-2 border-gray-300 mb-4'>
          <h1 className="text-3xl font-bold text-bottomNavBarColor my-4">Lorry Documents</h1>
        </div>

        <div className=" w-full flex items-center justify-center px-16">
          <Carousel
            opts={{
              align: "start",  // Align to start to behave more like grid
              slidesToScroll: 1,     // Show 5 items at a time
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {TruckDocArray.map((item, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/5"> {/* Take 1/5 of container */}
                  <div className="p-1">
                    <Link href={item.link}>
                      <div className="flex flex-col items-center justify-center gap-4 bg-white shadow-lg rounded-lg p-6 transition-all hover:bg-lightOrange transform hover:scale-105 w-48 h-48">
                        <div className="text-5xl text-bottomNavBarColor">{item.icon}</div>
                        <h2 className="text-xl font-semibold text-buttonTextColor text-center">{item.title}</h2>
                      </div>
                    </Link>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2">
              <CarouselPrevious />
            </div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2">
              <CarouselNext />
            </div>
          </Carousel>
        </div>

        {/* <div className="grid grid-cols-5 gap-6">
          {TruckDocArray.map((item: any, index: number) => (
            <Link key={index} href={item.link}>
              <div className="flex flex-col items-center justify-center gap-4 bg-white shadow-lg rounded-lg p-6 transition-all hover:bg-lightOrange transform hover:scale-105 w-48 h-48 ">
                <div className="text-5xl text-bottomNavBarColor">{item.icon}</div>
                <h2 className="text-xl font-semibold text-buttonTextColor text-center">{item.title}</h2>
              </div>
            </Link>

          ))}
        </div> */}
      </div>

          {/* Driver Docs */}
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
