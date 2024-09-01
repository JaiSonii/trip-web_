'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


const DetailsPage = () => {
  const [user, setUser] = useState<any>()
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  const fetchUser = async()=>{
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(()=>{
    fetchUser()
  },[])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user) {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        const res = await fetch(`/api/users`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
        if (!res.ok) {
          throw new Error('Failed to update party details');
        }
        setIsEditing(false);
        // Optionally refetch data
        
      } catch (err: any) {
        alert(err.message)
      }finally{
        fetchUser()
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      {user && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSave}>
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