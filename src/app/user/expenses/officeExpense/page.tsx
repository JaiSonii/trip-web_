'use client';

import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IExpense } from '@/utils/interface';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import { MdDelete, MdEdit, MdPayment } from 'react-icons/md';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import OfficeExpenseModal from '@/components/OfficeExpenseModal';
import { icons, IconKey } from '@/utils/icons';

const OfficeExpense: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [maintainenceBook, setMaintainenceBook] = useState<IExpense[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<IExpense | null>(null);

    const searchParams = useSearchParams();
    const monthYear = searchParams.get('monthYear')?.split(' ');
    const [month, year] = monthYear ? monthYear : [null, null];

    const getBook = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/officeExpense`);
            if (!res.ok) throw new Error('Error fetching expenses');
            const data = await res.json();
            setMaintainenceBook(data.expenses || []);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditExpense = async (expense: IExpense) => {
        try {
            const res = await fetch(`/api/officeExpense/${selected?._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expense),
            });
            if (!res.ok) {
                alert('Error Editing Data');
                return;
            }
            getBook();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSave = async (expense: any) => {
        try {
            const res = await fetch(`/api/officeExpense`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expense),
            });
            if (!res.ok) {
                alert('Error saving data');
                return;
            }
            const data = await res.json();
            setMaintainenceBook((prev) => [...prev, data.expense]);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDelete = async (expenseId: string) => {
        try {
            const res = await fetch(`/api/officeExpense/${expenseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                alert('Failed to delete expense');
                return;
            }
            setMaintainenceBook((prev) => prev.filter((item) => item._id !== expenseId));
        } catch (error: any) {
            alert(error.message);
        }
    };

    useEffect(() => {
        if (month && year) getBook();
    }, [month, year]);

    if (loading) return <Loading />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="w-full h-full p-4">
            <div className='flex items-center justify-between'>
                <h1 className="text-2xl font-bold mb-4 text-bottomNavBarColor">Office Expenses</h1>
                <Button onClick={() => setModalOpen(true)}>
                    <div className='flex items-center space-x-1'>
                        <span>Office Expense</span>
                        <IoAddCircle />
                    </div>
                </Button>
            </div>

            <div className="table-container overflow-auto bg-white shadow rounded-lg">
                <table className="custom-table w-full border-collapse table-auto">
                    <thead>
                        <tr className="bg-indigo-600 text-white">
                            <th className="border p-4 text-left">Date</th>
                            <th className="border p-4 text-left">Amount</th>
                            <th className="border p-4 text-left">Expense Type</th>
                            <th className="border p-4 text-left">Payment Mode</th>
                            <th className="border p-4 text-left">Notes</th>
                            <th className="border p-4 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintainenceBook.length > 0 ? (
                            maintainenceBook.map((expense, index) => (
                                <tr key={index} className="border-t hover:bg-indigo-100 cursor-pointer transition-colors">
                                    <td className="border p-4">
                                        <div className='flex items-center space-x-2'>
                                            <FaCalendarAlt className='text-bottomNavBarColor' />
                                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="border p-4">{expense.amount}</td>
                                    <td className="border p-4">
                                        <div className="flex items-center space-x-2">
                                            {icons[expense.expenseType as IconKey]}
                                            <span>{expense.expenseType}</span>
                                        </div>
                                    </td>
                                    <td className="border p-4">
                                        <div className="flex items-center space-x-2">
                                            <MdPayment className="text-green-500" />
                                            <span>{expense.paymentMode}</span>
                                        </div>
                                    </td>
                                    <td className="border p-4">{expense.notes || 'N/A'}</td>

                                    <td className="border p-4">
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" onClick={() => { setSelected(expense); setModalOpen(true); }} size="sm">
                                                <MdEdit />
                                            </Button>
                                            <Button variant="destructive" onClick={async () => {
                                                await handleDelete(expense._id as string);
                                            }} size={"sm"}>
                                                <MdDelete />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center p-4 text-gray-500">No expenses found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <OfficeExpenseModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelected(null);
                }}
                onSave={selected ? handleEditExpense : handleSave}
                selected={selected}
            />
        </div>
    );
};

const OfficeExpenseWrapper: React.FC = () => (
    <Suspense fallback={<Loading />}>
        <OfficeExpense />
    </Suspense>
);

export default OfficeExpenseWrapper;
