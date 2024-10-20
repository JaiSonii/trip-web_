'use client'
import React from 'react'
import RenderDocument from '../RenderDocument'
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
                            <td className="py-2 px-3 border-b border-gray-200 text-sm">
                                <div className="flex items-center space-x-3">
                                    {/* Render Document */}
                                    <div className="flex-shrink-0"><RenderDocument documentUrl={doc.url} /></div>

                                    {/* Document Details */}
                                    <div className="flex flex-col space-y-1">
                                        <p className="font-semibold text-gray-800">{doc.filename}</p>
                                        {doc.trip_id && (
                                            <div className="text-xs text-gray-600">
                                                <p><span className="font-medium">LR:</span> {doc.LR}</p>
                                                <p><span className="font-medium">Truck:</span> {doc.truck}</p>
                                                <p><span className="font-medium">Route:</span> {doc.route.origin} &rarr; {doc.route.destination}</p>
                                                <p><span className="font-medium">Start Date:</span> {new Date(doc.startDate).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">{doc.type}</td>
                            <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">{new Date(doc.uploadedDate).toLocaleDateString('en-IN')}</td>
                            <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
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