'use client';

import { truckTypesIcons } from '@/utils/utilArray';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { FaChevronRight, FaFileContract, FaFolder, FaFolderOpen, FaLeaf, FaList, FaRegIdCard } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { useExpenseCtx } from '@/context/context';
import { FaShieldAlt, FaThLarge } from 'react-icons/fa';
import folderIcon from '@/assets/folder-icon.png'
import Image from 'next/image';
import { TbReceiptTax } from 'react-icons/tb';

const TruckDocArray = [
  {
    title: 'Registration Certificate',
    icon: <FaRegIdCard className='text-bottomNavBarColor' size={70} /> // Icon representing an ID card or certificate
  },
  {
    title: 'Permit',

    icon: <FaFileContract className='text-bottomNavBarColor' size={70} /> // Icon representing a legal permit or document
  },
  {
    title: 'Insurance',

    icon: <FaShieldAlt className='text-bottomNavBarColor' size={70} /> // Icon representing protection or insurance
  },
  {
    title: 'Pollution Certificate',

    icon: <FaLeaf className='text-bottomNavBarColor' size={70} /> // Icon representing environmental or pollution-related certification
  },
  {
    title: 'Fitness Certificate',

    icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
  },
  
  {
    title: 'Tax',

    icon: <TbReceiptTax className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
  },
  {
    title: 'Other',

    icon: <FaFolderOpen className='text-bottomNavBarColor' size={70} /> // Folder icon for "Other" category
  },

];

const TruckDocuments = () => {
  const { isLoading, trucks } = useExpenseCtx()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')

  const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'))
  const TruckDocumentUpload = dynamic(() => import('@/components/documents/TruckDocumentUpload'))



  const fetchDocuments = useCallback(async () => {
    if (!type) return;

    setMessage('Fetching documents...');
    setLoading(true);

    try {
      const res = await fetch(`/api/trucks/documents?type=${encodeURIComponent(type)}`);
      const data = await res.json();
      if (res.ok && data.documents.length > 0) {
        setDocuments(data.documents);
        
        setMessage('');
      } else {
        setDocuments([]);
        setMessage('No documents found');
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setMessage('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const getTruckIcon = (truckType: string) => {
    const truckIconObj = truckTypesIcons.find((iconObj) => iconObj.type === truckType);
    return truckIconObj ? (
      <truckIconObj.Icon size={70} className="text-bottomNavBarColor mb-4" />
    ) : (
      <FaFolder size={70} className="text-bottomNavBarColor mb-4" />
    );
  };

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.truckType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocs = documents?.filter(
    (doc) =>
      doc.truckNo.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      doc.truckType.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#FBFBFB] min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
          <Button variant="link" className="p-0 m-0">
            <Link href={`/user/documents`} className="text-2xl font-semibold hover:underline">
              Docs
            </Link>
          </Button>
          <FaChevronRight className="text-lg text-gray-500" />
          <span>Lorry Docs</span>
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
          <Button onClick={() => setModalOpen(true)}>Upload Document</Button>
        </div>
      </div>

      <div className="my-4">
        <h1 className="text-lg font-semibold text-black my-4">Select Document Type</h1>
        <div className="grid grid-cols-7 gap-2">
          {TruckDocArray.map((item: any, index: number) => (
            <div
              key={index}
              onClick={() => setType((prev) => prev === item.title ? '' : item.title)}
              className="col-span-1 max-h-[200px]"
            >
              <div
                className={`flex flex-col items-center justify-center border border-gray-300 gap-4 bg-[#FBFBFB] rounded-lg p-6 transition-all hover:shadow-md transform hover:scale-105 cursor-pointer h-full ${type === item.title ? 'bg-lightOrange' : ''}`}
              >
                {item.icon}
                <h2 className="text-lg font-semibold text-black text-center truncate max-w-full whitespace-normal h-[50px] flex items-center justify-center">
                  {item.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>


      {!type ? (
        <div>
          <h1 className="text-lg font-semibold text-black py-4 mt-4">Or Select Lorry</h1>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4'}>
            {filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck) => (
                <Link
                  href={{
                    pathname: `/user/documents/truckDocuments/${truck.truckNo}`,
                  }}
                  key={truck.truckNo}
                >
                  <div
                    className={`bg-white p-6 rounded-xl hover:shadow-md border border-gray-300 transition-all duration-300 ease-in-out hover:bg-gray-50 cursor-pointer ${viewMode === 'grid' ? 'h-full flex justify-between items-center' : 'flex items-center space-x-4'}`}
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={folderIcon}
                        alt='folder icon'
                        width={48}
                        height={48}
                        className="object-contain"
                        priority
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold">{truck.truckNo}</span>
                      <span className="text-gray-500">{truck.truckType}</span>
                      <span className="text-gray-500">{truck.supplierName}</span>
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
        <div className='py-4'>
          {loading ?
            <p className='text-center'>{loadingIndicator} {message}</p> :
            filteredDocs.length > 0 ? <RecentDocuments docs={filteredDocs} /> : <p>No documents found</p>
          }
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <TruckDocumentUpload open={modalOpen} setOpen={setModalOpen} />
        </div>
      )}
    </div>
  );
};

export default TruckDocuments;
