'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { IDriver } from '@/utils/interface';
import { loadingIndicator } from '../ui/LoadingIndicator';
import { FaChevronRight } from 'react-icons/fa6';
import { useToast } from '../hooks/use-toast';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TripDocumentProps {
    driverId: string;
}

const DriverDocuments: React.FC<TripDocumentProps> = ({ driverId }) => {

    const DriverDocumentUpload = dynamic(() => import('@/components/documents/DriverDocumentUpload'), { ssr: false })
    const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'))

    const [documents, setDocuments] = useState<any>([]);
    const [modalOpen, setModalOpen] = useState(false)
    const [driver, setDriver] = useState<IDriver>()
    const [loading, setLaoding] = useState(true)
    const {toast} = useToast()

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const response = await fetch(`/api/drivers/${driverId}`);
                if(!response.ok){
                    toast({
                        description : 'Failed to load documents',
                        variant : 'destructive'
                    })
                    return
                }
                const data = await response.json();
                setDocuments(data.driver.documents);
                setDriver(data)
            } catch (error) {
                toast({
                    description : 'Failed to load documents',
                    variant : 'destructive'
                })
            } finally {
                setLaoding(false)
            }

        };

        fetchDriver();
    }, [driverId]);



    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
                    <Button variant={'link'}>
                        <Link href="/user/documents"  className="text-2xl font-semibold hover:underline">
                            Docs
                        </Link>
                    </Button>

                    <FaChevronRight className="text-lg text-gray-500" />
                    <Button variant={'link'}>
                        <Link href="/user/documents/driverDocuments"  className="text-2xl font-semibold hover:underline">
                            Driver Docs
                        </Link>
                    </Button>

                    <FaChevronRight className="text-lg text-gray-500" />
                    <span  className="text-2xl font-semibold hover:underline">{driver?.name}</span>
                </h1>
                <Button onClick={() => setModalOpen(true)}>
                    Upload Document
                </Button>
            </div>
            {loading && loadingIndicator}
            <RecentDocuments docs={documents} />
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <DriverDocumentUpload open={modalOpen} setOpen={setModalOpen} driverId={driverId} setDocuments={setDocuments}/>
                </div>
            )}
        </div>
    );
};

export default DriverDocuments;
