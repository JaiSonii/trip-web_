'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaRoute, FaTruck } from 'react-icons/fa';
import { PiSteeringWheel } from 'react-icons/pi';
import { GoOrganization } from 'react-icons/go';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';

const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false });

const DocumentsPage = () => {
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    tripDocuments: 0,
    driverDocuments: 0,
    truckDocuments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecentDocuments = async () => {
    try {
      const res = await fetch(`/api/documents/recent`);
      if (!res.ok) {
        throw new Error('Failed to fetch recent documents');
      }
      const data = await res.json();
      if (data.documents.length === 0) {
        setError('No recent documents found');
        return;
      }

      // Update both recentDocs and counts
      setRecentDocs(data.documents);
      setCounts(data.counts);  // Assuming `data.counts` contains {tripDocuments, driverDocuments, truckDocuments}
    } catch (error: any) {
      console.log(error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

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
      icon: <FaTruck className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Company Documents',
      link: '#',
      icon: <GoOrganization className='text-bottomNavBarColor' size={40} />
    }
  ];

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black">Documents</h1>
      </div>

      <div className="grid grid-cols-4 gap-4 border-b-2 border-gray-300 py-4">
        {documentTypes.map((type) => (
          <Link href={type.link} key={type.title}>
            <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer">
              <div className="flex flex-col items-start">
                {type.icon}
                <h1 className="text-left text-lg font-semibold text-black mt-4">
                  {type.title}
                </h1>
                <p className="text-gray-400">
                  {/* Display the counts from the state */}
                  {type.title === 'Trip Documents' && counts.tripDocuments + ' files'}
                  {type.title === 'Driver Documents' && counts.driverDocuments + ' files'}
                  {type.title === 'Lorry Documents' && counts.truckDocuments + ' files'}
                  {type.title === 'Company Documents' && '0 files'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-2">
          <h1 className="text-xl text-black font-semibold my-4">Recently Uploaded</h1>
        </div>
        {loading && <div>{loadingIndicator}</div>}
        {error && <p className="text-red-500">{error}</p>}
        {recentDocs && <RecentDocuments docs={recentDocs} />}
      </div>
    </div>
  );
};

export default DocumentsPage;
