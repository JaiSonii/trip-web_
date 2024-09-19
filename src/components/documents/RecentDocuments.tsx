import React from 'react'
import { renderDocument } from '../RenderDocument'

type props = {
    docs: any[]
}

const RecentDocuments: React.FC<props> = ({ docs }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {docs?.map((doc: any, index: number) => (
                doc?.url && renderDocument(
                    doc.type,
                    doc.url,
                    {
                        ...(doc.driver_id && { Name: doc.name, Contact: doc.contactNumber }),
                        ...(doc.truckNo && { Lorry: doc.truckNo, type: doc.truckType }),
                        ...(doc.trip_id) && {trip_id : doc.trip_id, truck : doc.truck , origin : doc.route.origin, dest : doc.route.destination, LR : doc.LR, startDate : doc.startDate}
                    }
                )
            ))}

        </div>
    )
}

export default RecentDocuments