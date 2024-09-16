'use client';

import { IDriver } from '@/utils/interface';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaFolder } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DriverDocumentUpload from '@/components/documents/DriverDocumentUpload';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const DriverDocuments = () => {
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false)
  const [docuemnts, setDocuments] = useState<any[]>([])

  const RecentDocuments = dynamic(()=>import('@/components/documents/RecentDocuments'),{ssr : false})

  const params = useSearchParams()
  const type = params.get('type')

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`/api/drivers`);
      const data = res.ok ? await res.json() : alert('Failed to fetch drivers');
      setDrivers(data.drivers);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch drivers');
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/drivers/documents?type=${encodeURIComponent('License')}`)
      const data = res.ok ? await res.json() : alert('Failed to fetch documents');
      setDocuments(data.documents)
    } catch (error) {
      alert('Failed to fetch documents')
      console.log(error)
    }
  }

  useEffect(() => {
    if (type) {
      fetchDocuments()
    } else {
      fetchDrivers();
    }

  }, []);

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
        <h1 className="text-3xl font-bold text-bottomNavBarColor">Driver Documents</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search by name or contact number"
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
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver) => (
            <Link href={`/user/documents/driverDocuments/${driver.driver_id}`} key={driver.driver_id}>
              <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer ${viewMode === 'grid' ? 'h-full' : 'flex items-center space-x-4'}`}>
                <FaFolder className="text-bottomNavBarColor mb-4" size={50} />
                <div className="flex flex-col">
                  <span className="font-semibold">{driver.name}</span>
                  <span className="text-gray-500">{driver.contactNumber || 'No Contact Number'}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center col-span-3 text-gray-500">No drivers found</div>
        )}
      </div>
      <div>
        {filteredDocs && <RecentDocuments docs={filteredDocs} />}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <DriverDocumentUpload open={modalOpen} setOpen={setModalOpen} />
        </div>
      )}
    </div>
  );
};

export default DriverDocuments;
