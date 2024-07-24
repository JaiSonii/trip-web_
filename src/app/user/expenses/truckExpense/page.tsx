'use client';
import Loading from '@/app/loading';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import { Button } from '@/components/ui/button';
import { ITruckExpense } from '@/utils/interface';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { fetchTruckExpense, handleAddCharge, handleDelete } from '@/helpers/ExpenseOperation';
import { fetchDriverName } from '@/helpers/driverOperations';
import TripRoute from '@/components/trip/TripRoute';
import DriverName from '@/components/driver/DriverName';

const TruckExpense: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintainenceBook, setMaintainenceBook] = useState<ITruckExpense[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<ITruckExpense | undefined>();

  const searchParams = useSearchParams();
  const monthYear = searchParams.get('monthYear')?.split(' ');
  const [month, year] = monthYear ? monthYear : [null, null];

  const getBook = async () => {
    try {
      setLoading(true);
      const truckExpenses = await fetchTruckExpense(month, year);
      setMaintainenceBook(truckExpenses);
    } catch (error) {
      setError((error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
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
              <th>Driver</th>
              <th>Trip</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {maintainenceBook.map((fuel, index) => (
              <tr
                key={index}
                className="border-t hover:bg-slate-100"
              >
                <td>{new Date(fuel.date).toLocaleDateString()}</td>
                <td>{fuel.amount}</td>
                <td>{fuel.expenseType}</td>
                <td>{fuel.paymentMode}</td>
                <td>{fuel.notes}</td>
                <td><DriverName driverId={fuel.driver as string}/></td>
                <td><TripRoute tripId={fuel.trip || ''} /></td>
                <td>
                    <div className='flex items-center gap-2'>
                    <Button variant={'outline'}
                    onClick={(e) => {
                        setSelected(fuel);
                        setModalOpen(true);
                    }}
                  >
                    <MdEdit />
                  </Button>
                  <Button variant={'destructive'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(fuel.id);
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
        onSave={handleAddCharge}
        driverId={selected?.driver || ''}
        selected={selected}
        truckPage={true}
      />
    </div>
  );
};

export default TruckExpense;
