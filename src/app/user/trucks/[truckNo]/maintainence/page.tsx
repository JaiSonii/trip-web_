'use client'
import Loading from '@/app/loading'
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal'
import TripRoute from '@/components/trip/TripRoute'
import { Button } from '@/components/ui/button'
import { fetchDriverName } from '@/helpers/driverOperations'
import { IExpense } from '@/utils/interface'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { MdDelete } from 'react-icons/md'

const maintainenceExpenseTypes = new Set([
  'Repair Expense',
  'Showroom Service',
  'Regular Service',
  'Minor Repair',
  'Gear Maintenance',
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


const TruckMaintainenceBook = () => {
  const { truckNo } = useParams()
  const [error, setError] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [maintainenceBook, setMaintainenceBook] = useState<IExpense[]>([])

  const [modelOpen, setModelOpen] = useState(false)
  const [selected, setSeclected] = useState<IExpense>()




  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trucks/${truckNo}/expense?type=maintenance`);
      if (!res.ok) {
        throw new Error('Failed to fetch maintenance book');
      }
      const data = await res.json();
      setMaintainenceBook(data);
    } catch (error: any) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMaintenance();
  }, [truckNo]);


  const handleDelete = async (id: string, e : React.FormEvent) => {
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
    setMaintainenceBook(maintainenceBook.filter((item) => item._id !== id));
    const deletedItem = maintainenceBook.find((item) => item._id === id);
  };

  const handleAddCharge = async (newCharge: any, id?: string) => {
    const truckExpenseData = {
      ...newCharge,
      truck: truckNo,
      transaction_id: newCharge.transactionId || '',
      driver: newCharge.driver || '',
      notes: newCharge.notes || '',
    };

    const res = await fetch(`/api/truckExpense/${id}`,{
      method : 'PUT',
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
    setMaintainenceBook((prev : IExpense[])=> {
     const index =  prev.findIndex(item=> item._id == data.charge._id)
     prev[index] = data.charge
     return prev
    })
  };


  if(loading) return <Loading />

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
              <th>notes</th>
              <th>Driver</th>
              <th>Trip</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook?.map((fuel, index) => (
              <tr key={index} className="border-t hover:bg-slate-100" onClick={()=>{
                setSeclected(fuel)
                setModelOpen(true)
              }}>
                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                <td>{fuel.amount}</td>
                <td>{fuel.expenseType}</td>
                <td>{fuel.paymentMode}</td>
                <td>{fuel.notes}</td>
                <td>{fetchDriverName(fuel.driver as string) || 'NA'}</td>
                <td><TripRoute tripId={fuel.trip_id || ''}/></td>
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

export default TruckMaintainenceBook