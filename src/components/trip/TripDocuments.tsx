'use client';

import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { pdfjs } from 'react-pdf';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TripDocument {
    trip_id: string;
    startDate: string;
    ewayBill: string;
    ewbValidityDate: string;
    POD: string;
    route: {
        origin: string;
        destination: string;
    };
}

const TripDocuments = () => {
    const [trips, setTrips] = useState<TripDocument[]>([]);

    useEffect(() => {
        const fetchTrips = async () => {
            const response = await fetch('/api/trips/documents');
            const data: TripDocument[] = await response.json();
            setTrips(data);
        };

        fetchTrips();
    }, []);

    const isValid = (ewbValidityDate: string) => {
        const today = new Date();
        const validityDate = new Date(ewbValidityDate);
        return validityDate >= today;
    };

    const isPdf = (fileName: string) => {
        return fileName.toLowerCase().includes('.pdf');
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className="text-3xl font-bold text-bottomNavBarColor">Trip Documents</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips?.map((trip) => (
                    <div
                        key={trip.trip_id}
                        className={`bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 hover:shadow-lg border-2 ${isValid(trip.ewbValidityDate) ? 'border-green-500' : 'border-red-500'}`}
                    >
                        <Link href={trip.ewayBill.split('.pdf')[0]} target="_blank" rel="noopener noreferrer">
                            <Link href={`/user/trips/${trip.trip_id}`}>
                                <Button variant={'link'}>
                                    <div className="flex items-center space-x-2 text-gray-600 mb-2 text-md">
                                        <span className="font-semibold">{trip.route.origin.split(',')[0]}</span>
                                        <FaArrowRight className="text-sm text-gray-500" />
                                        <span className="font-semibold">{trip.route.destination.split(',')[0]}</span>
                                    </div>
                                </Button>
                            </Link>

                            <p className="text-gray-500">Start Date: {new Date(trip.startDate).toLocaleDateString()}</p>
                            <p className={`text-gray-500 ${isValid(trip.ewbValidityDate) ? 'text-green-600' : 'text-red-600'}`}>
                                Validity Date: {trip.ewbValidityDate ? new Date(trip.ewbValidityDate).toLocaleDateString() : 'N/A'}
                            </p>

                            <div className="overflow-auto max-h-28 mt-4 rounded-md border border-gray-300">
                                {isPdf(trip.ewayBill) ? (
                                    <Document file={trip.ewayBill.split('.pdf')[0]} onLoadError={console.error}>
                                        <Page pageNumber={1} scale={0.8} />
                                    </Document>
                                ) : (
                                    <Image src={trip.ewayBill} alt="E-way Bill" className="w-full h-auto rounded-md" height={200} width={200} />
                                )}
                            </div>
                        </Link>

                        {trip.POD && (
                            <div className="mt-4">
                                <Link href={trip.POD} target="_blank" rel="noopener noreferrer">
                                    <Button variant={'link'}>
                                        View POD
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripDocuments;
