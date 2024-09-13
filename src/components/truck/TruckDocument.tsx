'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { renderDocument } from '../RenderDocument';

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


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-3xl font-bold text-bottomNavBarColor">
                    {truckNo}
                </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents?.RC && renderDocument('RC', documents.RC)}
                {documents?.Pollution && renderDocument('Pollution', documents.Pollution)}
                {documents?.Permit && renderDocument('Permit', documents.Permit)}
                {documents?.Insurance && renderDocument('Insurance', documents.Insurance)}
            </div>
        </div>
    );
};

export default TruckDocuments;
