'use client';
import Loading from '@/app/user/loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { ITripCharges, IExpense } from '@/utils/interface';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { fetchTripExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';

import TripRoute from '@/components/trip/TripRoute';
import DriverName from '@/components/driver/DriverName';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


const TripExpensePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<ITripCharges[] | IExpense[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [chargeModal, setChargeModal] = useState(false)
  const [selected, setSelected] = useState<ITripCharges | IExpense | any>();

  const searchParams = useSearchParams();
  const monthYear = searchParams.get('monthYear')?.split(' ');
  const [month, year] = monthYear ? monthYear : [null, null];
  const router = useRouter()

  const getBook = async () => {
    try {
      setLoading(true);
      const tripExpense = await fetchTripExpense(month, year);
      console.log(tripExpense)
      setMaintainenceBook(tripExpense);
    } catch (error) {
      setError((error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharge = async (chargeId : string) =>{
    const res = await fetch(`/api/tripCharges/${chargeId}`,{
      method : 'DELETE',
      headers : {
        'Content-Type' : 'application/json'
      }
    })
    const data = await res.json()
    console.log(data)
    router.refresh()
    
  }

  const handleEditExpense = async (expense: IExpense) => {
    try {
      const data = await handleAddCharge(expense, expense.id);
      router.refresh()// Close the modal after saving
    } catch (error) {
      console.log(error);
    }
  };
  

  useEffect(() => {
    if(month && year)
    getBook();
  }, [month, year]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Expense Type</th>
              <th>Payment Mode</th>
              <th>Notes</th>
              <th>Truck</th>
              <th>Driver</th>
              <th>Trip</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook && maintainenceBook.map((fuel : any, index) => (
              <tr
                key={index}
                className="border-t hover:bg-slate-100"
              >
                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                <td>{fuel.amount}</td>
                <td>{fuel.expenseType}</td>
                <td>{fuel.paymentMode}</td>
                <td>{fuel.notes}</td>
                <td>{fuel.truck ? fuel.truck : ''}</td>
                <td>{fuel.driver ? <DriverName driverId={fuel.driver}/> : ''}</td>
                <td>{fuel.trip_id ? <TripRoute tripId={fuel.trip_id} /> : ''}</td>
                <td>
                    <div className='flex items-center gap-2'>
                    <Button variant={'outline'}
                    onClick={(e) => {
                        setSelected(fuel);
                        if(fuel.partyBill === false){
                        }else{
                          setModalOpen(true)
                          router.refresh()
                        }
                    }}
                  >
                    {fuel.partyBill === false ? <Link href={`/user/trips/${fuel.trip_id}`}>View Trip</Link> : <MdEdit />}
                  </Button>
                  <Button variant={'destructive'}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setSelected(fuel)
                      if(fuel.partyBill === false){
                        handleDeleteCharge(fuel._id)
                      }else{
                        await handleDelete(fuel._id);
                        router.refresh()
                      }
                      
                    }}
                  >
                    <MdDelete/>
                  </Button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleEditExpense}
        driverId={selected?.driver as string}
        selected={selected}
      />
    </div>
  );
};

export default TripExpensePage;
