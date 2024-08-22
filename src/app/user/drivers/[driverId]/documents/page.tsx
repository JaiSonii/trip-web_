'use client'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'

// Define allowed document types
const allowedDocuments = ["License", "Aadhar", "PAN", "PoliceVerification"];

const DriverDocuments = () => {
  const { driverId } = useParams()
  const [documents, setDocuments] = useState<any>({})
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchDriverDocs = async () => {
    const response = await fetch(`/api/drivers/${driverId}/documents`)
    const data = await response.json()
    setDocuments(data.documents)
  }

  useEffect(() => {
    if (driverId) {
      fetchDriverDocs()
    }
  }, [driverId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!allowedDocuments.includes(name)) {
      alert(`The document type "${name}" is not allowed. Please upload one of the following: ${allowedDocuments.join(", ")}`);
      return;
    }

    if (file && name) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('name', name)

        const response = await fetch(`/api/drivers/${driverId}/documents`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          fetchDriverDocs() // Refresh the documents after upload
          setName('') // Clear the input fields
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
      alert('Please provide a document name and file.')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between bg-gray-200 rounded-sm p-3">
        <h1 className="text-2xl font-semibold text-gray-800">Driver Documents</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Upload Document
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-600">Document Name</label>
              <select 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Document</option>
                {allowedDocuments.map((docType) => (
                  <option key={docType} value={docType}>{docType}</option>
                ))}
              </select>
            </div>

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

      <div>
        {allowedDocuments.map((docType) => (
          <div key={docType} className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700">{docType}</h2>
            {documents[docType] ? (
              <div className="flex justify-between items-center bg-lightOrangeButtonColor p-3 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-800">{docType}</span>
                <Link href={documents[docType].split('.pdf')[0]} target="_blank" rel="noopener noreferrer" className="text-sm text-buttonTextColor hover:underline">
                  View Document
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No document uploaded.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DriverDocuments
