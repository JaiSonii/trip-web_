'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import RenderDocument from '../RenderDocument';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import RecentDocuments from '../documents/RecentDocuments';
import Link from 'next/link';
import TruckDocumentUpload from '../documents/TruckDocumentUpload';
import { FaChevronRight } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TruckDocumentProps {
    truckNo: string;
}

const TruckDocuments: React.FC<TruckDocumentProps> = ({ truckNo }) => {

    const [documents, setDocuments] = useState<any>([]);
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        const fetchTruck = async () => {
            try {
                const response = await fetch(`/api/trucks/${truckNo}`);
                const data = response.ok ? await response.json() : alert('Failed to load documents');
                setDocuments(data.truck.documents);
            } catch (error) {
                console.log(error)
                toast({
                    description: 'Failed to load documents',
                    variant: 'destructive'
                })
            }
            setLoading(false)
        };

        fetchTruck();
    }, [truckNo]);



    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
                    <Button variant={'link'}>
                        <Link href="/user/documents" className="text-2xl font-semibold hover:underline">
                            Docs
                        </Link>
                    </Button>
                    <FaChevronRight className="text-lg text-gray-500" />
                    <Button variant={'link'}>
                        <Link href="/user/documents/truckDocuments" className="text-2xl font-semibold hover:underline">
                            Lorry Docs
                        </Link>
                    </Button>

                    <FaChevronRight className="text-lg text-gray-500" />
                    <span className="text-black">{truckNo}</span>
                </h1>
                <Button onClick={() => setModalOpen(true)}>
                    Upload Document
                </Button>
            </div>
            {loading ?
                <div className='flex flex-col items-center justify-center'><Loader2 className='text-bottomNavBarColor animate-spin' /><p className='text-black'>fetching documents...</p></div> :
                <RecentDocuments docs={documents} />
            }

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <TruckDocumentUpload open={modalOpen} setOpen={setModalOpen} truckNo={truckNo} setDocuments={setDocuments}/>
                </div>
            )}
        </div>
    );
};

export default TruckDocuments;
