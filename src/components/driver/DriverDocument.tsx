'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import DriverName from './DriverName';
import { renderDocument } from '../RenderDocument';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TripDocumentProps {
    driverId: string;
}

const DriverDocuments: React.FC<TripDocumentProps> = ({ driverId }) => {
    const [documents, setDocuments] = useState<any>([]);

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const response = await fetch(`/api/drivers/${driverId}`);
            const data = response.ok ? await response.json() : alert('Failed to load documents');
            console.log(data)
            setDocuments(data.documents);
            } catch (error) {
                console.log(error)
                alert('Failed to load documents');
            }
            
        };

        fetchDriver();
    }, [driverId]);



    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-3xl font-bold text-bottomNavBarColor">
                    <DriverName driverId={driverId} />
                </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents?.map((doc: any)=>(
                    doc && renderDocument(doc.type,doc.url)
                ))}
                {/* {documents?.License && renderDocument('License', documents.License)}
                {documents?.Aadhar && renderDocument('Aadhar', documents.Aadhar)}
                {documents?.PAN && renderDocument('PAN', documents.PAN)}
                {documents?.PoliceVerification && renderDocument('Police Verification', documents.PoliceVerification)} */}
            </div>
        </div>
    );
};

export default DriverDocuments;
