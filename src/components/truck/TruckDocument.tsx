'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import RenderDocument from '../RenderDocument';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import RecentDocuments from '../documents/RecentDocuments';
import Link from 'next/link';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TruckDocumentProps {
    truckNo: string;
}

const TruckDocuments: React.FC<TruckDocumentProps> = ({ truckNo }) => {

    const TruckDocumentUpload = dynamic(() => import('@/components/documents/TruckDocumentUpload'), { ssr: false })

    const [documents, setDocuments] = useState<any>([]);
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        const fetchTruck = async () => {
            try {
                const response = await fetch(`/api/trucks/${truckNo}`);
                const data = response.ok ? await response.json() : alert('Failed to load documents');
                setDocuments(data.truck.documents);
            } catch (error) {
                console.log(error)
                alert('Failed to load documents');
            }

        };

        fetchTruck();
    }, [truckNo]);


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
                    <Link href="/user/documents" className="hover:underline text-gray-800">
                        Docs
                    </Link>
                    <span className="text-gray-500">{`>`}</span>
                    <Link href="/user/documents/truckDocuments" className="hover:underline text-gray-800">
                        Lorry Docs
                    </Link>
                    <span className="text-gray-500">{`>`}</span>
                    <span className="text-black">{truckNo}</span>
                </h1>
                <Button onClick={() => setModalOpen(true)}>
                    Upload Document
                </Button>
            </div>
            <RecentDocuments docs={documents} />
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <TruckDocumentUpload open={modalOpen} setOpen={setModalOpen} truckNo={truckNo} />
                </div>
            )}
        </div>
    );
};

export default TruckDocuments;
