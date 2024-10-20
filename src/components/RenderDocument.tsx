'use client'

import Link from "next/link";
import Image from "next/image";

const isPdf = (fileName: string) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};

export const renderDocument = (documentUrl: string) => {
    return (
        <Link href={documentUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative overflow-hidden h-40 rounded-lg border border-gray-300 transition-shadow duration-200 group w-[200px]">
                {isPdf(documentUrl) ? (
                    <div className="flex justify-center items-center h-full w-full group-hover:opacity-90 overflow-y-hidden overflow-x-hidden">
                        {/* Render PDF using iframe */}
                        <iframe
                            src={documentUrl.split('.pdf')[0]}
                            className="w-full h-full"
                            title="PDF Preview"
                        />
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full w-full">
                        {/* Render Image for image file types */}
                        <Image
                            src={documentUrl}
                            alt='Document preview'
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
};
