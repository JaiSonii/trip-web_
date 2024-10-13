'use client'

import Link from "next/link";
import { Document, Page, pdfjs } from 'react-pdf'
import Image from "next/image";

const isPdf = (fileName: string) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const renderDocument = (documentUrl: string) => {
    return (
        <Link href={documentUrl.split('.pdf')[0]} target="_blank" rel="noopener noreferrer">
            <div className="relative overflow-hidden h-40 w-full rounded-lg border border-gray-300 transition-shadow duration-200 group">
                {isPdf(documentUrl) ? (
                    <div className="flex justify-center items-center h-full w-full group-hover:opacity-90">
                        <Document
                            file={documentUrl.split('.pdf')[0]}
                            onLoadError={console.error}
                            className="w-full h-full"
                        >
                            <Page pageNumber={1} scale={0.4} className="w-full h-full" />
                        </Document>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full w-full">
                        <Image
                            src={documentUrl}
                            alt={''}
                            className="rounded-md object-cover w-full h-full"
                            height={160}
                            width={160}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
            </div>
        </Link>
    );
}