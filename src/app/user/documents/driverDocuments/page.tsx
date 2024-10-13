'use client';

import { IDriver } from '@/utils/interface';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { FaChevronRight, FaFolder, FaFolderOpen, FaList, FaPassport, FaRegIdCard } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DriverDocumentUpload from '@/components/documents/DriverDocumentUpload';
import folderIcon from '@/assets/folder-icon.png'
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { FaIdCardAlt, FaRegCheckCircle, FaThLarge } from 'react-icons/fa';
import { useExpenseCtx } from '@/context/context';
import Image from 'next/image'

const DriverDocuments = () => {
  const { drivers, isLoading } = useExpenseCtx()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false)
  const [docuemnts, setDocuments] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')

  const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false })

  const DriverDocArray = [
    {
      title: 'License',
      icon: <FaRegIdCard className='text-bottomNavBarColor' size={70} /> // Icon representing an ID card or certificate
    },
    {
      title: 'Aadhar',
      icon: <FaIdCardAlt className='text-bottomNavBarColor' size={70} /> // Icon representing a legal permit or document
    },
    {
      title: 'PAN',
      icon: <FaPassport className='text-bottomNavBarColor' size={70} /> // Icon representing protection or insurance
    },
    {
      title: 'Police Verification',
      icon: <FaRegCheckCircle className='text-bottomNavBarColor' size={70} /> // Icon representing environmental or pollution-related certification
    },
    {
      title: 'Other',
      icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
    }
  ];


  const fetchDocuments = useCallback(async () => {
    if (type) {
      try {
        setMessage('fetching documents...')
        const res = await fetch(`/api/drivers/documents?type=${encodeURIComponent(type as string)}`)
        const data = res.ok ? await res.json() : setMessage('Falied to fetch documents');
        setDocuments(data.documents)
        setMessage('')
        if (data.documents.length === 0) {
          setMessage('No documents found')
          return
        }
      } catch (error) {
        alert('Failed to fetch documents')
        console.log(error)
        setMessage('Falied to fetch documents')
      } finally {
        setLoading(false)
      }
    }
  },[type])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments]);

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocs = docuemnts.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
          <Button variant="link" className="p-0 m-0">
            <Link href={`/user/documents`} className="text-2xl font-semibold hover:underline">
              Docs
            </Link>
          </Button>
          <FaChevronRight className="text-lg text-gray-500" />
          <span>Driver Docs</span>
        </h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300"
          />
          {!type && (
            <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? (
                <FaList className="text-xl" />
              ) : (
                <FaThLarge className="text-xl" />
              )}
            </Button>
          )}
          <Button onClick={() => setModalOpen(true)}>
            Upload Document
          </Button>
        </div>
      </div>

      <div className="my-4">
        <h1 className="text-lg font-semibold text-black my-4">Select Document Type</h1>
        <div className="grid grid-cols-5 gap-4">
          {DriverDocArray.map((item: any, index: number) => (
            <div key={index} onClick={() => setType((prev) => prev === item.title ? '' : item.title)}>
              <div className={`flex flex-col items-center justify-center border border-gray-300 gap-4 bg-[#FBFBFB] rounded-lg p-6 transition-all hover:shadow-md transform hover:scale-105 cursor-pointer ${type === item.title ? 'bg-lightOrange' : ''}`}>
                {item.icon}
                <h2 className="text-xl font-semibold text-black text-center">{item.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!type ? (
        <div>
          <h1 className="text-lg font-semibold text-black py-4 mt-4">Or Select Driver</h1>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4'}>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => (
                <Link
                  href={{
                    pathname: `/user/documents/driverDocuments/${driver.driver_id}`,
                  }}
                  key={driver.driver_id}
                >
                  <div
                    className={`bg-white p-6 rounded-xl hover:shadow-lg border border-gray-300 transition-shadow duration-300 ease-in-out hover:bg-gray-50 cursor-pointer ${viewMode === 'grid' ? 'h-full flex justify-between items-center space-x-4' : 'flex items-center space-x-6 w-full px-8 py-6'}`}
                  >
                    {/* Folder Icon */}
                    <div className="flex-shrink-0">
                      <Image
                        src={folderIcon}
                        alt="folder icon"
                        width={48}
                        height={48}
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Driver Details */}
                    <div className="flex flex-col flex-grow">
                      <span className="font-semibold text-black">{driver.name}</span>
                      <span className="text-gray-500">{driver.contactNumber || 'No Contact Number'}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <span className="text-center col-span-3 text-gray-500">
                {(isLoading || loading) && loadingIndicator} {message}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4">
          {loading ? (
            <p className="text-center">{loadingIndicator} {message}</p>
          ) : (
            filteredDocs.length > 0 ? <RecentDocuments docs={filteredDocs} /> : <p>No documents found</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <DriverDocumentUpload open={modalOpen} setOpen={setModalOpen} />
        </div>
      )}
    </div>
  );
};

export default DriverDocuments;
