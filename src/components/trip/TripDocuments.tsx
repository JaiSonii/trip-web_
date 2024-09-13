'use client';

import React from 'react';
import { Document, Page } from 'react-pdf';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { pdfjs } from 'react-pdf';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { renderDocument } from '../RenderDocument';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TripDocumentProps {
    trip_id: string;
    POD: string;
    ewayBill: string | undefined;
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
