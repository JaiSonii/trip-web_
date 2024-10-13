import React from 'react'
import { renderDocument } from '../RenderDocument'
import { Document, Page, pdfjs } from 'react-pdf'
import Image from 'next/image'
import Link from 'next/link'

type props = {
    docs: any[]
}

const isPdf = (fileName: string) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const RecentDocuments: React.FC<props> = ({ docs }) => {
    return (
        <div className="py-2 px-1 rounded-lg shadow-sm border-2 border-gray-300">

            {/* {docs?.map((doc: any, index: number) => (
                doc?.url && renderDocument(
                    doc.type,
                    doc.url,
                    {
                        ...(doc.driver_id && { Name: doc.name, Contact: doc.contactNumber }),
                        ...(doc.truckNo && { Lorry: doc.truckNo, type: doc.truckType }),
                        ...(doc.trip_id) && {trip_id : doc.trip_id, truck : doc.truck , origin : doc.route.origin, dest : doc.route.destination, LR : doc.LR, startDate : doc.startDate}
                    }
                )
            ))} */}
            <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-xl">
                <thead className="">
                    <tr className=" bg-gray-200">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Type</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date Uploaded</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Validity Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {docs?.map((doc: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b-2 border-gray-300">
                                <div className="flex items-center space-x-2">
                                    <Link href={doc.url.split('.pdf')[0]} target="_blank" rel="noopener noreferrer">
                                        <div className="relative overflow-hidden h-32 w-24 rounded-md border border-gray-300 shadow-md group">
                                            {isPdf(doc.documentUrl) ? (
                                                <div className="flex justify-center items-center h-full w-full group-hover:opacity-90">
                                                    <Document
                                                        onLoadError={console.error}
                                                        className="w-full h-full"
                                                    >
                                                        <Page pageNumber={1} scale={0.4} className="w-full h-full" />
                                                    </Document>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center items-center h-full w-full">
                                                    <Image
                                                        src={doc.url}
                                                        alt={doc.filename}
                                                        className="rounded-md object-cover w-full h-full"
                                                        height={128}
                                                        width={96} // Adjust width and height for uniformity
                                                    />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md"></div>
                                        </div>
                                    </Link>
                                    <p className="text-sm text-gray-600">{doc.filename}</p>
                                    {doc.trip_id &&
                                        <div className="text-gray-700">
                                            <p><strong className='font-semibold'>LR Number:</strong> {doc.LR}</p>
                                            <p><strong className='font-semibold'>Truck:</strong> {doc.truck}</p>
                                            <p><strong className='font-semibold'>Route:</strong> {doc.route.origin} &rarr; {doc.route.destination}</p>
                                            <p><strong className='font-semibold'>Start Date:</strong> {new Date(doc.startDate as string).toLocaleDateString()}</p>

                                        </div>
                                    }



                                </div>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-500 border-b-2 border-gray-300">
                                {doc.type}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-500 border-b-2 border-gray-300">
                                {new Date(doc.uploadedDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-500 border-b-2 border-gray-300">
                                {doc.validityDate ? new Date(doc.validityDate).toLocaleDateString('en-IN') : 'NA'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


        </div>
    )
}

export default RecentDocuments