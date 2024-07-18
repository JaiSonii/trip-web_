'use client'
import Loading from '@/app/loading'
import { ITruckExpense } from '@/utils/interface'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const maintainenceExpenseTypes = new Set([
  'Repair Expense',
  'Showroom Service',
  'Regular Service',
  'Minor Repair',
  'Gear Maintainence',
  'Brake Oil Change',
  'Grease Oil Change',
  'Spare Parts Purchase',
  'Air Filter Change',
  'Tyre Puncture',
  'Tyre Retread',
  'Tyre Purchase',
  'Roof Top Repair'
])

interface TripDetails {
  [key: string]: string;
}


const OtherExpense = () => {
  const { truckNo } = useParams()
  const [error, setError] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [maintainenceBook, setMaintainenceBook] = useState<ITruckExpense[]>()
  const [tripDetails, setTripDetails] = useState<TripDetails>({})

  useEffect(() => {
    const getBook = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/trucks/${truckNo}/expense`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!res.ok) {
          console.log(error)
          alert("Please try again")
        }
        const data = await res.json()
        const filteredData = data.filter((expense: ITruckExpense) => !maintainenceExpenseTypes.has(expense.expenseType))
        setMaintainenceBook(filteredData)
      } catch (error) {
        console.log(error)
      }finally{
        setLoading(false)
      }
    }
    getBook()
  }, [truckNo])

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!maintainenceBook) return
      const tripDetails: TripDetails = {}

      for (const book of maintainenceBook) {
        if (book.trip && !tripDetails[book.trip]) {
          const tripRes = await fetch(`/api/trips/${book.trip}`)
          const data = await tripRes.json()
          const trip = data.trip
          if (trip) {
            tripDetails[book.trip] = `${trip.route.origin.split(',')[0]} -> ${trip.route.destination.split(',')[0]}`
          }
        }
      }

      setTripDetails(tripDetails)
    }

    fetchTripDetails()
  }, [maintainenceBook])


  if(loading) return <Loading />

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
            {maintainenceBook?.map((fuel, index) => (
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

export default OtherExpense