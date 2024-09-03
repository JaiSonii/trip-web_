import React from 'react'
import dynamic from 'next/dynamic'

const TripDocuments = dynamic(() => import('@/components/trip/TripDocuments'), { ssr: false });


const TripDocumentsPage = () => {
  return (
    <div><TripDocuments /></div>
  )
}

export default TripDocumentsPage