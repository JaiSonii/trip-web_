'use client'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'

const documentTypes = ["RC", "Insurance", "Permit", "Pollution Certificate"]

const TruckDocuments = () => {
  const { truckNo } = useParams()
  const [documents, setDocuments] = useState<any>({})
  const [file, setFile] = useState<File | null>(null)
  const [currentDocType, setCurrentDocType] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchTruckDocs = async () => {
    const response = await fetch(`/api/trucks/${truckNo}/documents`)
    const data = await response.json()
    setDocuments(data.documents)
  }

  useEffect(() => {
    if (truckNo) {
      fetchTruckDocs()
    }
  }, [truckNo])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (file && currentDocType) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('docType', currentDocType)

        const response = await fetch(`/api/trucks/${truckNo}/documents`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          fetchTruckDocs() // Refresh the documents after upload
          setFile(null)
          setIsModalOpen(false) // Close the modal after successful upload
        } else {
          throw new Error('Failed to upload document')
        }
      } catch (error) {
        console.error('Error uploading document:', error)
        alert('Error uploading document')
      }
    } else {
      alert('Please select a document type and upload a file.')
    }
  }

  const handleUploadClick = (docType: string) => {
    setCurrentDocType(docType)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Truck Documents</h1>
      </div>

      {documentTypes.map((docType, index) => (
        <div key={index} className="mb-6 bg-gray-200 rounded-sm p-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-gray-800">{docType}</h2>
            {documents[docType] && (
              <Link href={documents[docType].split('.pdf')[0]} target="_blank" rel="noopener noreferrer" className="text-sm text-buttonTextColor hover:underline">
                View {docType}
              </Link>
            )}
          </div>
          <Button onClick={() => handleUploadClick(docType)}>
            {documents[docType] ? `Replace ${docType}` : `Upload ${docType}`}
          </Button>
        </div>
      ))}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {currentDocType}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="file" className="text-sm font-medium text-gray-600">Upload File</label>
              <input
                type="file"
                id="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 file:bg-lightOrangeButtonColor file:border-none file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-darkOrangeButtonColor"
              />
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg py-2">
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TruckDocuments
