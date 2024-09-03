'use client'
import { IDriver } from '@/utils/interface'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { FaFolder } from 'react-icons/fa6'

const DriverDocuments = () => {
  const [drivers, setDrivers] = useState<IDriver[]>([])

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`/api/drivers`)
      const data = res.ok ? await res.json() : alert('Failed to fetch Drivers')
      setDrivers(data.drivers)
    } catch (error) {
      console.log(error)
      alert('Failed to fetch Drivers')
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-3xl font-bold text-bottomNavBarColor">Driver Documents</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <Link href={`/user/documents/driverDocuments/${driver.driver_id}`} key={driver.id}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer h-full">
              <div className="flex flex-col items-center h-full justify-between">
                <FaFolder className="text-bottomNavBarColor mb-4" size={70} />
                <div className="text-center text-xl font-semibold text-buttonTextColor flex flex-col space-y-2 items-center">
                  <span>{driver.name}</span>
                  <span>{driver.contactNumber || 'No Contact Number'}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DriverDocuments
