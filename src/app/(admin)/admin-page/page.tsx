'use client'

import React, { useEffect, useState } from 'react'
import { HomeIcon, UsersIcon, BuildingIcon as BuildingOfficeIcon, CogIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const AdminPage = () => {
  const router = useRouter()


  const [users, setUsers] = useState<any>()

  const fetchUsers = async()=>{
    try {
      const res = await fetch('/api/admin/users',{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        }
      })
      if (res.status === 401){
        localStorage.removeItem('adminToken')
        router.push('/user/profile/details')
      }
      if (res.ok){
        const data = await res.json()
        setUsers(data.users)
      }else{
        throw new Error('Error fetching Users')
      }
    } catch (error) {
      console.log(error)
      alert('Failed to fetch users')
    }
  }

  useEffect(()=>{
    fetchUsers()
  },[])

  return (
    <div className="min-h-screen bg-white">
      <div className='p-4 flex items-center justify-start gap-3'>
      <Image src={'/awajahi logo.png'} height={50} width={50} alt='Awajahi Logo' />
      <h1 className='text-black text-lg font-semibold'>Awajahi</h1>
      </div>
      
        
        <div className="grid grid-cols-5 gap-4 p-4">
          <div className="col-span-1 bg-white ">
            <ul className="flex flex-col gap-4 p-4 text-lg">
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <HomeIcon size={20} />
                <span>Dashboard</span>
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <UsersIcon size={20} />
                <span>Users</span>
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <BuildingOfficeIcon size={20} />
                <span>Companies</span>
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <CogIcon size={20} />
                <span>Settings</span>
              </li>
            </ul>
          </div>
          <div className="col-span-4 bg-white">
            <h1 className="text-2xl font-bold mb-4">User Details</h1>
            <div className="py-2 px-1 rounded-lg shadow-sm border-2 border-gray-300">
              <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-xl">
                <thead className='rounded-lg'>
                  <tr className="bg-gray-200 rounded-lg">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Role</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Company Name</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Address</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Device Type</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user : any, index : number) => (
                    <tr key={index} className={'hover:bg-gray-50'}>
                      <td className="py-2 px-3 border-b border-gray-200 text-sm">{user?.phone || ''}</td>
                      <td className="py-2 px-3 border-b border-gray-200 text-sm">{user?.name || ''}</td>
                      <td className="py-2 px-3 border-b border-gray-200 text-sm">{user?.role?.name || ''}</td>
                      <td className="py-2 px-3 border-b border-gray-200 text-sm">{user?.companyName || ''}</td>
                      <td className="py-2 px-3 border-b border-gray-200 text-sm">{user?.address || ''}</td>
                      <td className="py-2 px-3 border-b border-gray-200 text-sm">{user?.deviceType || ''}</td>
                      <td className="py-2 px-3 border-b border-gray-200 text-sm">{user?.lastLogin || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  )
}

export default AdminPage
