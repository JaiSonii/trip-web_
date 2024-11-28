'use client'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'
import { useTruck } from '@/context/truckContext'
import RecentDocuments from '@/components/documents/RecentDocuments'
import { loadingIndicator } from '@/components/ui/LoadingIndicator'
import TruckDocumentUpload from '@/components/documents/TruckDocumentUpload'

const documentTypes = ["RC", "Insurance", "Permit", "Pollution Certificate"]

const TruckDocuments = () => {
  const {truck, setTruck, loading} = useTruck()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if(loading){
    return <div>{loadingIndicator}</div>
  }
   

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Truck Documents</h1>
        <Button onClick={()=>setIsModalOpen(true)}>
          Uplaod Document
        </Button>
      </div>

      <RecentDocuments docs={truck?.documents} />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='p-0 max-w-lg'>
         <TruckDocumentUpload truckNo={truck?.truckNo} open={isModalOpen} setOpen={setIsModalOpen} setTruck={setTruck} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TruckDocuments
