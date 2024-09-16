'use client';

import { truckTypesIcons } from '@/utils/utilArray';
import { TruckModel } from '@/utils/interface';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaFolder } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TruckDocumentUpload from '@/components/documents/TruckDocumentUpload';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const TruckDocuments = () => {
  const [trucks, setTrucks] = useState<TruckModel[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])

  const RecentDocuments = dynamic(()=>import('@/components/documents/RecentDocuments'))

  const type = useSearchParams().get('type')

  const fetchTrucks = async () => {
    try {
      const res = await fetch(`/api/trucks`);
      const data = res.ok ? await res.json() : alert('Failed to fetch Trucks');
      setTrucks(data.trucks);
    } catch (error) {
      console.log(error);
      alert('Failed to fetch Trucks');
    }
  };

  const fetchDocuments = async () => {
    if (type) {
      try {
        const res = await fetch(`/api/trucks/documents?type=${encodeURIComponent(type)}`)
        const data = res.ok ? await res.json() : alert('Failed to fetch documents');
        console.log(data)
        setDocuments(data.documents)
      } catch (error) {
        alert('Failed to fetch documents')
        console.log(error)
      }
    }
  }

  useEffect(() => {
    if (type) {
      fetchDocuments()
    } else {
      fetchTrucks();
    }
  }, []);

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
      doc.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.truckType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-3xl font-bold text-bottomNavBarColor">Truck Documents</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search by truck number or type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300"
          />
          <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            Upload Document
          </Button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4'}>
        {filteredTrucks.length > 0 ? (
          filteredTrucks.map((truck) => (
            <Link href={`/user/documents/truckDocuments/${truck.truckNo}`} key={truck.truckNo}>
              <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer ${viewMode === 'grid' ? 'h-full' : 'flex items-center space-x-4'}`}>
                {getTruckIcon(truck.truckType)}
                <div className="flex flex-col">
                  <span className="font-semibold">{truck.truckNo}</span>
                  <span className="text-gray-500">{truck.truckType}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center col-span-3 text-gray-500">No trucks found</div>
        )}
      </div>
      <div>
        {filteredDocs && <RecentDocuments docs={filteredDocs} />}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <TruckDocumentUpload open={modalOpen} setOpen={setModalOpen} />
        </div>
      )}
    </div>
  );
};

export default TruckDocuments;
