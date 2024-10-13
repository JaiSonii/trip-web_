'use client'
import React from 'react'
import { renderDocument } from '../RenderDocument'
type props = {
    docs: any[]
}

const isPdf = (fileName: string) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};



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
                                    {renderDocument(doc.url)}
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