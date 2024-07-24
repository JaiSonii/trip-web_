'use client'
import Loading from '@/app/loading'
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal'
import TripRoute from '@/components/trip/TripRoute'
import { Button } from '@/components/ui/button'
import { fetchDriverName } from '@/helpers/driverOperations'
import { ITruckExpense } from '@/utils/interface'
import { connectToDatabase, tripExpenseSchema } from '@/utils/schema'
import { model, models } from 'mongoose'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { MdDelete } from 'react-icons/md'

interface TripDetails {
    [key: string]: string;
}

const TruckFuelBook = () => {
    const { truckNo } = useParams()
    const [fuelBook, setFuelBook] = useState<ITruckExpense[]>([])
    const [loading, setLoading] = useState(true)
    const [tripDetails, setTripDetails] = useState<TripDetails>({})
    const [modelOpen, setModelOpen] = useState(false)
    const [selected, setSelected] = useState<ITruckExpense>()

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


    const handleDelete = async (id: string , e : React.FormEvent) => {
        e.stopPropagation()
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
        setFuelBook(fuelBook.filter((item) => item._id !== id));
        const deletedItem = fuelBook.find((item) => item._id === id);
    };

    const handleAddCharge = async (newCharge: any, id?: string) => {
        const truckExpenseData = {
            ...newCharge,
            truck: truckNo,
            transaction_id: newCharge.transactionId || '',
            driver: newCharge.driver || '',
            notes: newCharge.notes || '',
        };

        const res = await fetch(`/api/truckExpense/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(truckExpenseData),
        })
        if (!res.ok) {
            alert('Failed to add charge');
            return;
        }
        const data = await res.json()
        setFuelBook((prev: ITruckExpense[]) => {
            const index = prev.findIndex(item => item._id == data.charge._id)
            prev[index] = data.charge
            return prev
        })
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
                            <th>PaymentMode</th>
                            <th>Notes</th>
                            <th>Driver</th>
                            <th>Trip</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fuelBook?.map((fuel, index) => (
                            <tr key={index} className="border-t hover:bg-slate-100" onClick={() => {
                                setSelected(fuel)
                                setModelOpen(true)
                            }}>
                                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                                <td>{fuel.amount}</td>
                                <td>{fuel.paymentMode}</td>
                                <td>{fuel.notes}</td>
                                <td>{fetchDriverName(fuel.driver as string) || 'NA'}</td>
                                <td><TripRoute tripId={fuel.trip || ''} /></td>
                                <td>
                                    <Button onClick={(e) => handleDelete(fuel._id as string,e)} variant={'destructive'} ><MdDelete /></Button>
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

export default TruckFuelBook
