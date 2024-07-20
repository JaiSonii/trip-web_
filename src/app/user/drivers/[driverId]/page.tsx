'use client'
import React, { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { MdDelete, MdEdit } from "react-icons/md";
import DriverLayout from '@/components/driver/driverLayout';
import { IDriver, IDriverAccount, ITrip, ITruckExpense, PaymentBook } from '@/utils/interface';
import Loading from '@/app/loading';
import { ExpenseforDriver } from '@/helpers/ExpenseOperation';
import { handleDelete as DeleteForExpense } from '@/helpers/ExpenseOperation';
import { DeleteAccount } from '@/helpers/TripOperation';
import { deleteDriverAccount } from '@/helpers/driverOperations';
import { Button } from '@/components/ui/button';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';

const Driver: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { driverId } = useParams();

  const [driver, setDriver] = useState<IDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [expenseEdit, setExpeneEdit] = useState(false)
  const [paymentEdit, setPaymentEdit] = useState(false)
  const [accountEdit, setAccountEdit] = useState(false)
  const [selected, setSelected] = useState<any>([])

  const handleDelete = async (account: any) => {
    if (account.expenseType) {
      console.log(account.expenseType)
      const result = await DeleteForExpense(account._id);
      console.log(result)
      setAccounts((prev) => (
        prev.filter(acc => acc._id != account._id)
      ))
    }
    else if (account.accountType) {
      try {
        const deleted = await DeleteAccount(account._id, account.tripId)
        setAccounts((prev) => prev.filter(acc => acc.paymentBook_id == deleted.paymentBook_id))
      } catch (error) {
        console.log(error)
        alert(error)
      }
    }
    else {
      try {
        const data = await deleteDriverAccount(driverId as string, account.account_id)
        const deletedDriver = data.driver
        console.log(deletedDriver)
        setAccounts(prev => prev.filter(acc => acc.account_id != account.account_id))
      } catch (error: any) {
        console.log(error)
        alert(error)
      }
    }
  };

  const fetchDriverDetails = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver');
      }

      const result = await response.json();
      setDriver(result);
      setAccounts(result.accounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      const trips = data.trips.filter((trip: ITrip) => trip.driver === driverId);

      const accountsData = trips.flatMap((trip: ITrip) =>
        trip.accounts
          .filter((acc: PaymentBook) => acc.receivedByDriver === true)
          .map((acc: PaymentBook) => ({
            ...acc,
            tripId: trip.trip_id,
            date: acc.paymentDate,
            type: 'trip',
          }))
      );

      return accountsData;
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  };

  const fetchTruckExpenses = async () => {
    try {
      const truckExpense = await ExpenseforDriver(driverId as string);
      const formattedTruckExpenses = truckExpense.map((expense: ITruckExpense) => ({
        ...expense,
        date: expense.date,
        type: 'truck',
      }));
      return formattedTruckExpenses;
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const accountsData = await fetchTrips();
    const truckExpensesData = await fetchTruckExpenses();

    const allAccounts = [
      ...accountsData,
      ...truckExpensesData,
    ];

    setAccounts((prev) => [...prev, ...allAccounts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    fetchDriverDetails();
    fetchAllData();
  }, [driverId]);


  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!driver) {
    return <div>No driver found</div>;
  }

  return (
    <div className="w-full">
      <DriverLayout name={driver.name} status={driver.status} driverId={driver.driver_id} onDriverUpdate={setDriver} contactNumber={driver.contactNumber} />
      <div className="w-full h-full p-4">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Driver Gave</th>
                <th>Driver Got</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index: number) => (
                <tr key={index}>
                  <td>{new Date(account.date).toLocaleDateString()}</td>
                  <td>{account.reason || account.expenseType || `Trip ${account.accountType} (from a trip)`}</td>
                  <td>{account.gave || (account.type === 'truck' && account.amount) || ''}</td>
                  <td>{account.got || (account.type !== 'truck' && account.amount) || ''}</td>
                  <td>
                    <div className='flex flex-row gap-2 items-center w-full'>
                    <Button
                      variant={'outline'}
                      onClick={() => {
                        if (account.expenseType) {
                          setExpeneEdit(true)
                          setSelected(account)
                        }
                        else if (account.accountType) {
                          setPaymentEdit(true)
                        }
                        else {
                          setAccountEdit(true)
                      }}}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      variant={'destructive'}
                      onClick={() => {
                        handleDelete(account);
                      }}
                    >
                      <MdDelete />
                    </Button>
                    </div>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ExpenseModal
        isOpen={expenseEdit}
        onClose={() => setExpeneEdit(false)}
        onSave={()=>{}}
        driverId={selected.driver || ''}
        selected={selected}
      />
    </div>
  );
};

export default Driver;
