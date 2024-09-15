import React from 'react'
import { renderDocument } from '../RenderDocument'

type props = {
    docs : any[]
}

const RecentDocuments:React.FC<props> = ({docs}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {docs?.map((doc: any, index: number) => (
                doc?.url && renderDocument(doc.type, doc.url)
            ))}
        </div>
    )
}

export default RecentDocuments