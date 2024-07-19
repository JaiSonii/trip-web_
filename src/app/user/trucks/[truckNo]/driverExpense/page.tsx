'use client'
import Loading from '@/app/loading'
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal'
import { Button } from '@/components/ui/button'
import { ITruckExpense } from '@/utils/interface'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { MdDelete } from 'react-icons/md'
import { maintenanceChargeTypes } from '@/utils/utilArray'

interface TripDetails {
  [key: string]: string;
}

const OtherExpense = () => {
  const { truckNo } = useParams()
  const [error, setError] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [maintainenceBook, setMaintainenceBook] = useState<ITruckExpense[]>([])
  const [tripDetails, setTripDetails] = useState<TripDetails>({})
  const [modelOpen, setModelOpen] = useState(false)
  const [selected, setSelected] = useState<ITruckExpense>()

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
        const filteredData = data.filter((expense: ITruckExpense) => !maintenanceChargeTypes.has(expense.expenseType))
        setMaintainenceBook(filteredData)
      } catch (error) {
        console.log(error)
      } finally {
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row's click event from being triggered
    const res = await fetch(`/api/truckExpense/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      alert('Failed to delete expense');
      return;
    }
    setMaintainenceBook(maintainenceBook.filter((item) => item._id !== id));
  };

  const handleAddCharge = async (newCharge: any, id?: string) => {
    const truckExpenseData = {
      ...newCharge,
      truck: truckNo,
      transaction_id: newCharge.transactionId || '',
      driver: newCharge.driver || '',
      notes: newCharge.notes || '',
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/truckExpense/${id}` : `/api/trucks/${truckNo}/expense`;

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truckExpenseData),
    });

    if (!res.ok) {
      alert('Failed to add charge');
      return;
    }

    const data = await res.json();

    setMaintainenceBook((prev: any[]) => {
      if (id) {
        return prev.map((item) =>
          item._id === id ? data.charge : item
        );
      } else {
        return [...prev, data.charge];
      }
    });
  };

  if (loading) return <Loading />

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Expense Type</th>
              <th>PaymentMode</th>
              <th>Notes</th>
              <th>Trip</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook?.map((fuel, index) => (
              <tr key={index} className="border-t hover:bg-slate-100" onClick={() => {
                setSelected(fuel)
                setModelOpen(true)
              }}>
                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                <td>{fuel.amount}</td>
                <td>{fuel.expenseType}</td>
                <td>{fuel.paymentMode}</td>
                <td>{fuel.notes}</td>
                <td>{tripDetails[fuel.trip] || 'NA'}</td>
                <td>
                  <Button onClick={(e) => handleDelete(fuel._id as string, e)} variant={'destructive'} ><MdDelete /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseModal
        isOpen={modelOpen}
        onClose={() => setModelOpen(false)}
        onSave={handleAddCharge}
        driverId=''
        selected={selected}
        truckPage={true}
      />
    </div>
  )
}

export default OtherExpense
