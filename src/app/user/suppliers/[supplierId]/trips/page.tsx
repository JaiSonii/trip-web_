'use client'
import { Button } from '@/components/ui/button'
import { fetchBalance } from '@/helpers/fetchTripBalance'
import { ISupplier, ITrip } from '@/utils/interface'
import { statuses } from '@/utils/schema'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'


const SupplierDetailPage = () => {

    const { supplierId } = useParams()
    const [trips, setTrips] = useState<ITrip[]>([])

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
    }

    useEffect(() => {
        if (supplierId) {
            fetchSupplierTrips(supplierId as string)
        }
    }, [supplierId])
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
                            <th className='border p-2'>Supplier Balance</th>
                            <th className='border p-2'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip, index) => (
                            <tr key={index} className="border-t hover:bg-slate-100 cursor-pointer">
                                <td className="border p-2">{new Date(trip.startDate).toLocaleDateString()}</td>
                                <td className="border p-2">{trip.truck}</td>
                                <td className="border p-2">{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</td>

                                <td className="border p-2">{trip.truckHireCost}</td>
                                <td className="border p-2">{statuses[trip.status as number]}</td>
                                <td className="border p-2">{trip.truckHireCost}</td>
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