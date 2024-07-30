'use client'
import Loading from '@/app/loading'
import TripRoute from '@/components/trip/TripRoute'
import { Button } from '@/components/ui/button'
import { ISupplierAccount, ITrip } from '@/utils/interface'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
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

  const handleDeleteAccount = async(paymentId : string)=>{
    const res = await fetch(`/api/suppliers/${supplierId}/payments/${paymentId}`,{
      method : 'DELETE',
      headers : {
        'Content-Type' : 'application/json'
      }
    })
    if(!res.ok){
      alert('Failed to delete payment')
      return
    }
    const data = res.json()
    setAccounts(accounts.filter((acc : ISupplierAccount)=>acc._id!==paymentId))
  }

  if(loading) return <Loading />

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold mb-4">Trips</h1>
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
                <td className="border p-2">{new Date(acc.date).toLocaleDateString()}</td>
                <td className="border p-2">
                <div className="flex items-center">
                    <span className="font-medium">Trip Payment</span>
                    <span className="ml-2 text-gray-600">
                      <TripRoute tripId={acc.trip_id}/>
                    </span>
                  </div>
                </td>
                <td className="border p-2">{acc.amount}</td>
                <td className="border p-2"></td>
                <td className='border p-2'>
                  <div className='flex items-center gap-2'>
                  <Link href={`/user/trips/${acc.trip_id}`}><Button variant={'outline'}>View Trip</Button></Link>
                    <Button onClick={()=> handleDeleteAccount(acc._id as string)} variant={'destructive'}><MdDelete /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {trips && trips.map((trip: ITrip, index: number) => (
              <tr key={index} className="border-t hover:bg-slate-100 cursor-pointer">
                <td className="border p-2">{new Date(trip.startDate).toLocaleDateString()}</td>
                <td className="border p-2">
                  <div className="flex items-center">
                    <span className="font-medium">{trip.truck}</span>
                    <span className="ml-2 text-gray-600">
                      {trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}
                    </span>
                  </div>
                </td>
                <td className="border p-2">{ }</td>
                <td className="border p-2">{trip.truckHireCost}</td>
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