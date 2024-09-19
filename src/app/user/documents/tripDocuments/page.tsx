'use client';

import { ITrip } from '@/utils/interface';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaFolder } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { useSearchParams } from 'next/navigation';

const TripDocumentsLanding = () => {

  const TripDocumentUpload = dynamic(() => import('@/components/documents/TripDocumentUpload'), { ssr: false })

  const [trips, setTrips] = useState<ITrip[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<any[]>([])

  const type = useSearchParams().get('type')

  const RecentDocuments = dynamic(()=>import('@/components/documents/RecentDocuments'), {ssr : false})

  const fetchDocuments = async()=>{
    try {
      setMessage('fetching documents...')
      const res = await fetch(`/api/trips/documents?type=${encodeURIComponent(type as string)}`)
      const data = res.ok? await res.json() : setMessage('Failed to fetch documents');
      setDocuments(data.documents)
      setMessage('')
      if(data.documents.length === 0){
        setMessage('No documents found')
        return
      }
    } catch (error) {
      console.error(error);
      alert('Failed to fetch documents');
      setMessage('Falied to fetch documents')
    }finally{
      setLoading(false)
    }
  }

  const fetchTrips = async () => {
    try {
      setMessage('fetching trips...')
      const res = await fetch(`/api/trips`);
      const data = res.ok ? await res.json() : setMessage('Failed to fetch trips');
      setTrips(data.trips);
      setMessage('')
      if (data.trips.length === 0) {
        setMessage('No trips found')
      }
    } catch (error) {
      console.error(error);
      alert('Failed to fetch trips');
    } finally {
      setLoading(false)
    }
  };



  useEffect(() => {
    if (type) {
      fetchDocuments()
    } else {
      fetchTrips();
    }
  }, []);

  const filteredTrips = trips.filter((trip) =>
    trip.route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(trip.startDate).toLocaleDateString().includes(searchTerm.toLowerCase()) ||
    trip.LR.toLowerCase().includes(searchTerm.toLowerCase())||
    trip.truck.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocs = documents.filter((doc) =>
    doc.route.origin.toLowerCase().includes(searchTerm.toLowerCase())||
    doc.route.destination.toLowerCase().includes(searchTerm.toLowerCase())||
    doc.LR.toLowerCase().includes(searchTerm.toLowerCase())||
    doc.truck.toLowerCase().includes(searchTerm.toLowerCase())||
    new Date(doc.startDate).toLocaleDateString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-3xl font-bold text-bottomNavBarColor">Trip Documents</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search by origin, destination, or date"
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
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <Link href={{
              pathname: `/user/documents/tripDocuments/${trip.trip_id}`,
            }} key={trip.trip_id}>
              <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer ${viewMode === 'grid' ? 'h-full' : 'flex items-center space-x-4'}`}>
                <FaFolder className="text-bottomNavBarColor mb-4" size={50} />
                <div className="flex flex-col">
                  <span className="font-semibold text-black">{trip.route.origin} &rarr; {trip.route.destination}</span>
                  <span className="text-gray-500">Start Date: {new Date(trip.startDate).toLocaleDateString()}</span>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>{trip.LR}</span>
                    <span className='text-gray-700'>{trip.truck}</span>
                  </div>

                </div>
              </div>
            </Link>
          ))
        ) : null}
        {message && <span className="text-center col-span-3 text-gray-500">{loading && loadingIndicator} {message}</span>}
      </div>
      <div>
        {filteredDocs && <RecentDocuments docs={filteredDocs} />}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <TripDocumentUpload open={modalOpen} setOpen={setModalOpen} />
        </div>
      )}
    </div>
  );
};

export default TripDocumentsLanding;
