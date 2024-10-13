'use client'
import Loading from '../../loading'
import TripRoute from '@/components/trip/TripRoute'
import { Button } from '@/components/ui/button'
import { ISupplierAccount, ITrip } from '@/utils/interface'
import { formatNumber } from '@/utils/utilArray'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCalendarAlt, FaRoute, FaTruck, FaWallet } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'

const SupplierPassbook = () => {
  const router = useRouter()
  const { supplierId } = useParams()
  const [trips, setTrips] = useState<any>([])
  const [accounts, setAccounts] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const fetchData = async () => {
    const [tripRes, paymentRes] = await Promise.all([
      fetch(`/api/suppliers/${supplierId}/payments/trips`),
      fetch(`/api/suppliers/${supplierId}/payments`)
    ])

    const [tripData, paymentData] = await Promise.all([
      tripRes.ok ? tripRes.json() : [],
      paymentRes.ok ? paymentRes.json() : []
    ])

    setTrips(tripData.trips)
    setAccounts(paymentData.supplierAccounts)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supplierId])

  const handleDeleteAccount = async (paymentId: string) => {
    const res = await fetch(`/api/suppliers/${supplierId}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) {
      alert('Failed to delete payment')
      return
    }
    const data = res.json()
    setAccounts(accounts.filter((acc: ISupplierAccount) => acc._id !== paymentId))
  }

  if (loading) return <Loading />

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Details</th>
              <th className="border p-2">Payment</th>
              <th className="border p-2">Expense</th>
              <th className='border p-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {accounts && accounts.map((acc: ISupplierAccount, index: number) => (
              <tr key={index} className="border-t hover:bg-slate-100 cursor-pointer">
                <td className="border p-2">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-bottomNavBarColor" />
                    <span>{new Date(acc.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="border p-2">
                  <div className="flex items-center justify-between space-y-2">
                    <span className="font-medium flex items-center space-x-2 p-1"><FaWallet className='text-bottomNavBarColor' /><span>Trip Payment</span></span>

                    <span className=" text-gray-600 flex items-center space-x-2 p-1">
                      <FaRoute className='text-bottomNavBarColor' />
                      <TripRoute tripId={acc.trip_id} />
                    </span>
                  </div>
                </td>
                <td className="border p-2"><span className='text-green-600 font-semibold'>₹{formatNumber(acc.amount)}</span></td>
                <td className="border p-2"></td>
                <td className='border p-2'>
                  <div className='flex items-center gap-2'>
                    <Link href={`/user/trips/${acc.trip_id}`}><Button variant={'outline'}>View Trip</Button></Link>
                    <Button onClick={() => handleDeleteAccount(acc._id as string)} variant={'destructive'}><MdDelete /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {trips && trips.map((trip: ITrip, index: number) => (
              <tr key={index} className="border-t hover:bg-slate-100 cursor-pointer">
                <td className="border p-2">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-bottomNavBarColor" />
                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="border p-2">
                  <div className="flex items-center justify-between space-y-2">
                    <span className="font-medium flex items-center space-x-2 p-1"><FaTruck className='text-bottomNavBarColor' /><span>{trip.truck}</span></span>

                    <span className=" text-gray-600 flex items-center space-x-2 p-1">
                      <FaRoute className='text-bottomNavBarColor' />
                      <TripRoute tripId={trip.trip_id} />
                    </span>
                  </div>
                </td>
                <td className="border p-2">{ }</td>
                <td className="border p-2"><span className='text-red-600 font-semibold'>₹{formatNumber(trip.truckHireCost)}</span></td>
                <td className='border p-2'><Link href={`/user/trips/${trip.trip_id}`}><Button variant='outline'>View Trip</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SupplierPassbook