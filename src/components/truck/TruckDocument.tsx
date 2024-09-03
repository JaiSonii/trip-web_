'use client';

import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import Link from 'next/link';
import { pdfjs } from 'react-pdf';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TruckDocumentProps {
    truckNo: string;
}

const TruckDocuments: React.FC<TruckDocumentProps> = ({ truckNo }) => {
    const [documents, setDocuments] = useState<any>({});

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

    const isPdf = (fileName: string) => fileName.toLowerCase().includes('.pdf');

    const renderDocument = (title: string, documentUrl: string) => (
        <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 hover:shadow-lg border-2 border-gray-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
            <Link href={documentUrl.split('.pdf')[0]} target="_blank" rel="noopener noreferrer">
                <div className="overflow-auto max-h-28 mt-4 rounded-md border border-gray-300">
                    {isPdf(documentUrl) ? (
                        <Document file={documentUrl.split('.pdf')[0]} onLoadError={console.error}>
                            <Page pageNumber={1} scale={0.8} />
                        </Document>
                    ) : (
                        <Image src={documentUrl} alt={title} className="w-full h-auto rounded-md" height={200} width={200} />
                    )}
                </div>
            </Link>
        </div>
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-3xl font-bold text-bottomNavBarColor">
                    {truckNo}
                </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents?.RC && renderDocument('License', documents.RC)}
                {documents?.Pollution && renderDocument('Aadhar', documents.Pollution)}
                {documents?.Permit && renderDocument('PAN', documents.Permit)}
                {documents?.Insurance && renderDocument('Police Verification', documents.Insurance)}
            </div>
        </div>
    );
};

export default TruckDocuments;
