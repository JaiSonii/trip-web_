'use client'
import React, { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { MdDelete, MdEdit } from "react-icons/md";
import DriverLayout from '@/components/driver/driverLayout';
import { IDriver, IDriverAccount, ITrip, IExpense, PaymentBook } from '@/utils/interface';
import Loading from '@/app/user/loading';
import { ExpenseforDriver } from '@/helpers/ExpenseOperation';
import { handleDelete as DeleteForExpense } from '@/helpers/ExpenseOperation';
import { DeleteAccount } from '@/helpers/TripOperation';
import { deleteDriverAccount, EditDriverAccount } from '@/helpers/driverOperations';
import { Button } from '@/components/ui/button';
import ExpenseModal from '@/components/trip/tripDetail/ExpenseModal';
import Modal from '@/components/trip/tripDetail/Modal';
import DriverModal from '@/components/driver/driverModal';
import { handleEditAccount } from '@/helpers/TripOperation';
import { handleAddCharge as EditExpense } from '@/helpers/ExpenseOperation';
import { FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

const Driver: React.FC = () => {
  const router = useRouter();
  const { driverId } = useParams();

  const [driver, setDriver] = useState<IDriver>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<IExpense[] | PaymentBook[] | any[]>([]);
  const [driverAccounts, setDriverAccounts] = useState<IDriverAccount[]>([])
  const [expenseEdit, setExpenseEdit] = useState(false);
  const [paymentEdit, setPaymentEdit] = useState(false);
  const [accountEdit, setAccountEdit] = useState(false);
  const [selected, setSelected] = useState<any>([]);

  const handleDelete = async (account: any) => {
    if (account.expenseType) {
      const result = await DeleteForExpense(account._id);
      setAccounts(prev => prev.filter(acc => acc._id !== account._id));
    } else if (account.accountType) {
      try {
        const deleted = await DeleteAccount(account._id, account.tripId);
        setAccounts(prev => prev.filter(acc => acc.paymentBook_id !== deleted.paymentBook_id));
      } catch (error) {
        console.log(error);
        alert(error);
      }
    } else {
      try {
        const data = await deleteDriverAccount(driverId as string, account.account_id);
        const deletedDriver = data.driver;
        setAccounts(prev => prev.filter(acc => acc.account_id !== account.account_id));
      } catch (error: any) {
        console.log(error);
        alert(error);
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
      setDriverAccounts(result.accounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await fetch(`/api/trips/driver/${driverId}/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await res.json();
      return data.accounts;
    } catch (err) {
      setError((err as Error).message);
      console.log(err)
      return [];
    }
  };

  const fetchTruckExpenses = async () => {
    try {
      const truckExpense = await ExpenseforDriver(driverId as string);
      const formattedTruckExpenses = truckExpense.map((expense: IExpense) => ({
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
      ...driverAccounts,
    ];

    setAccounts(allAccounts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

  const handleEditAccounts = async (account: any) => {
    if (account.expenseType) {
      // Handle expense edit logic
      console.log(account)
      const result = await EditExpense(account, selected._id, selected.truck)
      if (result.error) {
        alert(error)
        return
      }
      const editedAccount = result
      setAccounts(prev => prev.map((acc: any) => acc._id === selected._id ? { ...acc, ...result } : acc));

    } else if (account.accountType) {
      // Handle payment edit logic
      // console.log(selected)
      // console.log(account)
      const result = await handleEditAccount(account, selected.tripId)
      if (result.error) {
        alert(error)
        return
      }
      router.refresh()
    } else {
      try {
        const data = await EditDriverAccount(driverId as string, account, selected.account_id);
        setAccounts(prev => prev.map((acc: any) => acc.account_id === selected.account_id ? { ...acc, ...data } : acc));
      } catch (error) {
        alert(error);
      }
    }
    fetchAllData()
  };

  useEffect(() => {
    fetchDriverDetails();
  }, [driverId]);

  useEffect(() => {
    fetchAllData();
  }, [driverId, driverAccounts]);

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
                <tr key={account._id}>
                  <td>
                    <div className='flex items-center space-x-2'>
                      <FaCalendarAlt className='text-bottomNavBarColor' />
                      <span>{new Date(account.date || account.paymentDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td >
                    <div className='flex items-center space-x-2 '>
                      <span>{account.reason || account.expenseType || `Trip ${account.accountType} `}</span>
                      {account.trip_id && <Button variant={"link"} className='text-red-500 pt-1 rounded-lg'><Link href={`/user/trips/${account.trip_id}`}>from a trip</Link></Button>}
                    </div>
                  </td>
                  <td><span className='text-red-600 font-semibold'>{account.gave || (account.type === 'truck' && account.amount) || ''}</span></td>
                  <td ><span className='text-green-600 font-semibold'>{account.got || (account.type !== 'truck' && account.amount) || ''}</span></td>
                  <td>
                    <div className='flex flex-row gap-2 items-center w-full'>
                      <Button
                        variant={'outline'}
                        onClick={() => {
                          setSelected(account);
                          if (account.expenseType) {
                            setExpenseEdit(true);
                          } else if (account.accountType) {
                            setPaymentEdit(true);
                          } else {
                            setAccountEdit(true);
                          }
                        }}
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
        onClose={() => setExpenseEdit(false)}
        onSave={handleEditAccounts}
        driverId={selected.driver || ''}
        selected={selected}
      />
      {selected != null && <Modal
        isOpen={paymentEdit}
        onClose={() => setPaymentEdit(false)}
        onSave={handleEditAccounts}
        modalTitle="Edit Item"
        accountType={selected.accountType}
        editData={selected}
      />}
      <DriverModal
        open={accountEdit}
        onClose={() => setAccountEdit(false)}
        onConfirm={handleEditAccounts}
        type={selected.gave ? 'gave' : 'got'}
        selected={selected}
      />
    </div>
  );
};

export default Driver;
