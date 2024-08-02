'use client'
import { Button } from '@/components/ui/button'
import { fetchBalance } from '@/helpers/fetchTripBalance'
import { ISupplier, ITrip } from '@/utils/interface'
import { statuses } from '@/utils/schema'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Loading from '../../loading'
import { FaCalendarAlt, FaTruck, FaRoute } from 'react-icons/fa'


const SupplierDetailPage = () => {

    const { supplierId } = useParams()
    const [trips, setTrips] = useState<ITrip[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSupplierTrips = async (supplierId: string) => {
        const res = await fetch(`/api/trips/supplier/${supplierId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json()
        console.log(data)
        setTrips(data.trips)
        setLoading(false)
    }

    useEffect(() => {
        if (supplierId) {
            fetchSupplierTrips(supplierId as string)
        }
    }, [supplierId])

    if (loading) {
        return <Loading />
    }
    return (
        <div className="w-full h-full p-4">
            <h1 className="text-2xl font-bold mb-4">Trips</h1>
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Start Date</th>
                            <th className="border p-2">Truck Number</th>
                            <th className="border p-2">Route</th>
                            <th className="border p-2">Truck Hire Cost</th>
                            <th className="border p-2">Trip Status</th>
                            <th className='border p-2'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip, index) => (
                            <tr key={index} className="border-t hover:bg-slate-100 cursor-pointer">
                                <td className="border p-4 flex items-center space-x-2">
                                    <FaCalendarAlt className="text-[rgb(247,132,50)]" />
                                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                </td>
                                <td className="border p-4 space-x-2">
                                    <div className='flex items-center space-x-2'>
                                        <FaTruck className="text-[rgb(247,132,50)]" />
                                        <span>{trip.truck}</span>
                                    </div>

                                </td>
                                <td className="border p-4 flex items-center space-x-2">
                                    <div className='flex items-center space-x-2'>
                                        <FaRoute className="text-[rgb(247,132,50)]" />
                                        <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                                    </div>

                                </td>
                                <td>{trip.truckHireCost}</td>
                                <td className="border p-4">
                                    <div className="flex flex-col items-center space-x-2">
                                        <span>{statuses[trip.status as number]}</span>
                                        <div className="relative w-full bg-gray-200 h-1 rounded">
                                            <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td><Link href={`/user/trips/${trip.trip_id}`}><Button variant='outline'>View Trip</Button></Link></td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SupplierDetailPage