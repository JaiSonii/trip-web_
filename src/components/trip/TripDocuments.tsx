'use client';

import React from 'react';
import { Document, Page } from 'react-pdf';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { pdfjs } from 'react-pdf';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TripDocumentProps {
    trip_id: string;
    POD: string;
    ewayBill: string;
    ewbValidityDate: Date;
    route: {
        origin: string;
        destination: string;
    };
    startDate: Date;
}

const TripDocuments: React.FC<TripDocumentProps> = ({ trip_id, POD, ewayBill, ewbValidityDate, route, startDate }) => {
    // Helper function to check validity of e-way bill
    const isValid = (ewbValidityDate: Date) => {
        const today = new Date();
        return ewbValidityDate >= today;
    };

    // Helper function to check if the file is a PDF
    const isPdf = (fileName: string) => {
        return fileName.toLowerCase().endsWith('.pdf');
    };

    // Helper function to render PDF or Image
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
                <h1 className="text-3xl font-bold text-bottomNavBarColor">Trip Documents</h1>
            </div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2 text-md">
                    <span className="font-semibold">{route.origin.split(',')[0]}</span>
                    <FaArrowRight className="text-sm text-gray-500" />
                    <span className="font-semibold">{route.destination.split(',')[0]}</span>
                </div>

                <p className="text-gray-500">Start Date: {new Date(startDate).toLocaleDateString()}</p>
                <p className={`text-gray-500 ${isValid(ewbValidityDate) ? 'text-green-600' : 'text-red-600'}`}>
                    Validity Date: {new Date(ewbValidityDate).toLocaleDateString()}
                </p>

                {/* Grid Layout for E-way Bill and POD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ewayBill && renderDocument('Eway Bill', ewayBill)}
                    {POD && renderDocument('POD', POD)}
                </div>
                
        </div>
    );
};

export default TripDocuments;
