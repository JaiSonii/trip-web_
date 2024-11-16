'use client'

import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


const DetailsPage = () => {
  const [user, setUser] = useState<any>()

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logo, setLogo] = useState<File | null>(null)
  const [stamp, setStamp] = useState<File | null>(null)
  const [signature, setSignature] = useState<File | null>(null)
  const [previews, setPreviews] = useState({
    logo: '',
    stamp: '',
    signature: ''
  })


  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setUser(data.user)
      setPreviews({
        logo : data.user.logoUrl,
        stamp : data.user.stampUrl,
        signature : data.user.signatureUrl
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user) {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        const formdata = new FormData();
        formdata.append('data', JSON.stringify({
          name: user.name,
          company: user.company,
          gstNumber: user.gstNumber,
          address: user.address
        }))
        if (logo) formdata.append('logo', logo)
        if (stamp) formdata.append('stamp', stamp)
        if (signature) formdata.append('signature', signature)
        const res = await fetch(`/api/users`, {
          method: 'PUT',
          body: formdata,
        });
        if (!res.ok) {
          throw new Error('Failed to update party details');
        }
        setIsEditing(false);
        // Optionally refetch data
        const data = await res.json()
        setUser(data.user)
      } catch (err: any) {
        alert(err.message)
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>, previewKey: 'logo' | 'stamp' | 'signature') => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setter(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [previewKey]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const renderPreview = (type: 'logo' | 'stamp' | 'signature') => {
    const preview = previews[type]
    return (
      <div className="w-full h-40 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
        {preview ? (
          <iframe
            src={preview}
            className="w-full h-full no-scrollbar"
            style={{ border: 'none', overflow: 'hidden' }}
            title={`${type} preview`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Upload size={24} />
            <span className="mt-2">Upload {type}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl container border border-gray-300 shadow-md rounded-lg p-8">
      {user && (
        <form className="" onSubmit={handleSave}>
          <h2 className='text-black text-lg text-left my-2'>User Details</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className="block font-medium text-gray-700">Name:</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Company Name:</label>
              <input
                type="text"
                name="company"
                value={user.company || ''}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">GST Number:</label>
              <input
                type="text"
                name="gstNumber"
                value={user.gstNumber || ''}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Address:</label>
              <input
                type="text"
                name="address"
                value={user.address || ''}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
          </div>

          <h2 className='text-black text-lg text-left mb-2 mt-4'>Bank Details</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor="bankMsmeNo">MSME Number</label>
              <input
                id="bankMsmeNo"
                name="bankMsmeNo"
                value={user.bankDetails?.msmeNo || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankAccountNo">Account Number</label>
              <input
                id="bankAccountNo"
                name="bankAccountNo"
                value={user.bankDetails?.accountNo || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankIfscCode">IFSC Code</label>
              <input
                id="bankIfscCode"
                name="bankIfscCode"
                value={user.bankDetails?.ifscCode || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankName">Bank Name</label>
              <input
                id="bankName"
                name="bankName"
                value={user.bankDetails?.bankName || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankBranch">Bank Branch</label>
              <input
                id="bankBranch"
                name="bankBranch"
                value={user.bankDetails?.bankBranch || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-2 mt-2'>
            <div>
              <label htmlFor="logo">Logo</label>
              <input
                id="logo"
                name="logo"
                type="file"
                accept='image/*'
                onChange={(e) => handleFileChange(e, setLogo, 'logo')}
                disabled={!isEditing}
                hidden={!isEditing}
                className="mb-2"
              />
              {renderPreview('logo')}
            </div>
            <div>
              <label htmlFor="stamp">Stamp</label>
              <input
                id="stamp"
                name="stamp"
                type="file"
                onChange={(e) => handleFileChange(e, setStamp, 'stamp')}
                disabled={!isEditing}
                hidden={!isEditing}
                className="mb-2"
              />
              {renderPreview('stamp')}
            </div>
            <div>
              <label htmlFor="signature">Signature</label>
              <input
                id="signature"
                name="signature"
                type="file"
                onChange={(e) => handleFileChange(e, setSignature, 'signature')}
                disabled={!isEditing}
                hidden={!isEditing}
                className="mb-2"
                accept='image/*'
              />
              {renderPreview('signature')}
            </div>

          </div>

          <div className="flex justify-between col-span-2">
            <div className="mt-6 flex space-x-4">
              {isEditing ? (
                <>
                  <Button type="submit" variant="ghost">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
              )}
              <Button type="button" onClick={() => router.push('/user/parties')}>Back to Parties List</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default DetailsPage