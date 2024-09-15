'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import DriverName from './DriverName';
import RenderDocument from '../RenderDocument';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TripDocumentProps {
    driverId: string;
}

const DriverDocuments: React.FC<TripDocumentProps> = ({ driverId }) => {

    const DriverDocumentUpload = dynamic(()=> import('@/components/documents/DriverDocumentUpload'),{ssr : false})

    const [documents, setDocuments] = useState<any>([]);
    const [modalOpen, setModalOpen] = useState(false)

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
                <Button onClick={() => setModalOpen(true)}>
                    Upload Document
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents?.map((doc: any, index : number) => (
                    doc?.url && <RenderDocument documentUrl={doc.url} title={doc.type} key={index}/>
                ))}
                {/* {documents?.License && renderDocument('License', documents.License)}
                {documents?.Aadhar && renderDocument('Aadhar', documents.Aadhar)}
                {documents?.PAN && renderDocument('PAN', documents.PAN)}
                {documents?.PoliceVerification && renderDocument('Police Verification', documents.PoliceVerification)} */}
            </div>
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <DriverDocumentUpload open={modalOpen} setOpen={setModalOpen} driverId={driverId} />
                </div>
            )}
        </div>
    );
};

export default DriverDocuments;
