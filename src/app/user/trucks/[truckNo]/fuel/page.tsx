'use client'
import Loading from '@/app/loading'
import { ITruckExpense } from '@/utils/interface'
import { connectToDatabase, tripExpenseSchema } from '@/utils/schema'
import { model, models } from 'mongoose'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface TripDetails {
    [key: string]: string;
  }

const TruckFuelBook = () => {
    const { truckNo } = useParams()
    const [fuelBook, setFuelBook] = useState<ITruckExpense[]>()
    const [loading, setLoading] = useState(true)
    const [tripDetails, setTripDetails] = useState<TripDetails>({})

    useEffect(() => {
        const fetchFuel = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/trucks/${truckNo}/expense`)
                if (!res.ok) {
                    throw new Error('Failed to fetch fuel book')
                }
                const data = await res.json()
                const fuels = data.filter((expense: ITruckExpense) => expense.expenseType == 'Fuel Expense')
                setFuelBook(fuels)
            } catch (error: any) {
                console.log(error)
                alert(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchFuel()
    }, [truckNo])

    useEffect(() => {
        const fetchTripDetails = async () => {
            if (!fuelBook) return
            const tripDetails : TripDetails = {}

            for (const fuel of fuelBook) {
                if (fuel.trip && !tripDetails[fuel.trip]) {
                    const tripRes = await fetch(`/api/trips/${fuel.trip}`)
                    const data = await tripRes.json()
                    const trip = data.trip
                    if (trip) {
                        tripDetails[fuel.trip] = `${trip.route.origin.split(',')[0]} -> ${trip.route.destination.split(',')[0]}`
                    }
                }
            }

            setTripDetails(tripDetails)
        }

        fetchTripDetails()
    }, [fuelBook])

    if (loading) return <Loading />

    return (
        <div className="w-full h-full p-4">
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>PaymentMode</th>
                            <th>Trip</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fuelBook?.map((fuel, index) => (
                            <tr key={index} className="border-t hover:bg-slate-100">
                                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                                <td>{fuel.amount}</td>
                                <td>{fuel.paymentMode}</td>
                                <td>{tripDetails[fuel.trip] || 'NA'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TruckFuelBook
