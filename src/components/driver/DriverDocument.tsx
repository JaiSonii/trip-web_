'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import DriverName from './DriverName';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { IDriver } from '@/utils/interface';
import { loadingIndicator } from '../ui/LoadingIndicator';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TripDocumentProps {
    driverId: string;
}

const DriverDocuments: React.FC<TripDocumentProps> = ({ driverId }) => {

    const DriverDocumentUpload = dynamic(() => import('@/components/documents/DriverDocumentUpload'), { ssr: false })
    const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'))

    const [documents, setDocuments] = useState<any>([]);
    const [modalOpen, setModalOpen] = useState(false)
    const [driver,setDriver] = useState<IDriver>()
    const [loading , setLaoding] = useState(true)

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const response = await fetch(`/api/drivers/${driverId}`);
                const data = response.ok ? await response.json() : alert('Failed to load documents');
                console.log(data)
                setDocuments(data.documents);
                setDriver(data)
            } catch (error) {
                console.log(error)
                alert('Failed to load documents');
            }finally{
                setLaoding(false)
            }

        };

        fetchDriver();
    }, [driverId]);



    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
                    <Link href="/user/documents" className="hover:underline text-gray-800">
                        Docs
                    </Link>
                    <span className="text-gray-500">{`>`}</span>
                    <Link href="/user/documents/driverDocuments" className="hover:underline text-gray-800">
                        Driver Docs
                    </Link>
                    <span className="text-gray-500">{`>`}</span>
                    <span className="text-black">{driver?.name}</span>
                </h1>
                <Button onClick={() => setModalOpen(true)}>
                    Upload Document
                </Button>
            </div>
            {loading && loadingIndicator}
            <RecentDocuments docs={documents} />
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <DriverDocumentUpload open={modalOpen} setOpen={setModalOpen} driverId={driverId} />
                </div>
            )}
        </div>
    );
};

export default DriverDocuments;
