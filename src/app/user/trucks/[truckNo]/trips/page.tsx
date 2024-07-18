'use client'
import Loading from '@/app/loading'
import { fetchBalance } from '@/helpers/fetchTripBalance'
import { IParty, ITrip, TruckModel } from '@/utils/interface'
import { statuses } from '@/utils/schema'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const TruckTripsPage = () => {
    const router = useRouter()
    const [trips, setTrips] = useState<ITrip[]>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>()
    const [parties, setParties] = useState<IParty[]>()

    const { truckNo } = useParams()

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await fetch('/api/trips', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch trips');
                }

                const data = await res.json();
                setTrips(data.trips.filter((trip: ITrip) => trip.truck === truckNo));
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips()

        const fetchParties = async () => {
            try {
                const res = await fetch('/api/parties', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch parties');
                }

                const data = await res.json(); // Parse the response body as JSON
                setParties(data.parties);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                // Add a delay to improve UI experience even on fast networks
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        };
        fetchParties()
    }, [truckNo])

    if(loading) return <Loading />

    return (
        <div className="w-full h-full p-4">
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Start Date</th>
                            <th>LR Number</th>
                            <th>Party Name</th>
                            <th>Truck Number</th>
                            <th>Route</th>
                            <th>Status</th>
                            <th>Party Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips?.map((trip, index) => (
                            <tr key={index} className="border-t hover:bg-slate-100 cursor-pointer" onClick={() => router.push(`/user/trips/${trip.trip_id}`)}>
                                <td>{new Date(trip.startDate).toLocaleDateString()}</td>
                                <td>{trip.LR}</td>
                                <td>{parties?.find((party) => party.party_id == trip.party)?.name}</td>

                                <td>{trip.truck}</td>
                                <td>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</td>
                                <td>{statuses[trip.status as number]}</td>
                                <td>{fetchBalance(trip)}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TruckTripsPage