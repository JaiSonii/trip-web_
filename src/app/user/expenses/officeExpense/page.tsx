'use client';

import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IExpense } from '@/utils/interface';
import React, { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { MdDelete, MdEdit, MdPayment } from 'react-icons/md';
import { FaCalendarAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { icons, IconKey } from '@/utils/icons';
import { formatNumber, generateMonthYearOptions } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TbFilterSearch } from 'react-icons/tb';
import debounce from 'lodash.debounce';
import dynamic from 'next/dynamic';
import { handleAddExpense, handleEditExpense } from '@/helpers/ExpenseOperation';

const OfficeExpense: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [maintainenceBook, setMaintainenceBook] = useState<IExpense[] | any[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<IExpense | null>(null);
    const [visibleColumns, setVisibleColumns] = useState({
        date: true,
        amount: true,
        expenseType: true,
        notes: true,
        paymentMode: true,
        action: true,
    });
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
    const [searchQuery, setSearchQuery] = useState('')
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [shops, setShops] = useState<any[]>([])

    const ExpenseFilterModal = dynamic(() => import('@/components/ExpenseFilterModal'), { ssr: false })
    const AddExpenseModal = dynamic(()=> import('@/components/AddExpenseModal'), {ssr : false})

    const handleSelectAll = (selectAll: boolean) => {
        setVisibleColumns({
            date: selectAll,
            amount: selectAll,
            expenseType: selectAll,
            notes: selectAll,
            action: selectAll,
            paymentMode: selectAll,
        });
    };

    const handleToggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const [month, year] = [null, null];

    const getBook = async () => {
        try {
            setLoading(true);
            let res;
            if (month === null || year === null) {
                res = await fetch(`/api/expenses/officeExpense`)
            } else {
                res = await fetch(`/api/expenses/officeExpense?month=${month}&year=${year}`);
            }
            if (!res.ok) throw new Error('Error fetching expenses');
            const data = await res.json();
            setMaintainenceBook(data.expenses || []);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (expense: any) => {
        try {
            const res = await fetch(`/api/expenses/officeExpense`, {
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
            setMaintainenceBook((prev) => [
                data.expense,
                ...prev
            ])
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDelete = async (expenseId: string) => {
        try {
            const res = await fetch(`/api/expenses/${expenseId}`, {
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

    const handleFilter = async (filter: { paymentModes: string[], monYear: string[], shops: string[], expenseType: string[] }) => {
        try {
            const res = await fetch(`/api/expenses/officeExpense?filter=${encodeURIComponent(JSON.stringify(filter))}`)
            const data = await res.json()
            setMaintainenceBook(data.expenses)
        } catch (error) {
            console.log(error)
        } finally {
            setFilterModalOpen(false)
        }
    }

    const sortedExpense = useMemo(() => {
        if (!maintainenceBook || maintainenceBook.length === 0) return [];  // This line ensures that truckExpenseBook is not null or empty
        let filteredexpenses = [...maintainenceBook]

        if (searchQuery) {
            const lowercaseQuery = searchQuery.toLowerCase()
            filteredexpenses = maintainenceBook.filter((expense: any) =>
                expense.expenseType.toLowerCase().includes(lowercaseQuery) ||
                expense.paymentMode.toLowerCase().includes(lowercaseQuery) ||
                new Date(expense.date).toLocaleDateString().includes(lowercaseQuery) ||
                expense.amount.toString().includes(lowercaseQuery) ||
                expense.notes.toString().includes(lowercaseQuery) ||
                expense.shopName.toString().includes(lowercaseQuery)
            )
        }
        if (sortConfig.key !== null) {
            filteredexpenses.sort((a: any, b: any) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredexpenses;
    }, [maintainenceBook, sortConfig, searchQuery]);

    const requestSort = (key: any) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }
    const getSortIcon = (columnName: any) => {
        if (sortConfig.key === columnName) {
            return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
        }
        return <FaSort />
    }

    // Debounce the search input to reduce re-renders on each keystroke
    const debouncedSearch = useCallback(
        debounce((query) => setSearchQuery(query), 300),
        []
    );

    // Handle search input
    const handleSearch: any = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    };


    useEffect(() => {
        getBook();
    }, [month, year]);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await fetch('/api/shopkhata')
                const data = await res.json()
                setShops(data.shops)
            } catch (error) {
                console.error(error)
            }
        }
        fetchShops()
    }, [])

    if (loading) return <Loading />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="w-full h-full">
            <div className=" flex items-center justify-between w-full mb-1 gap-16">
                <div className='flex items-center space-x-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline">Select Columns</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={Object.values(visibleColumns).every(Boolean)}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                    <span>Select All</span>
                                </label>
                            </DropdownMenuItem>
                            {Object.keys(visibleColumns).map((column) => (
                                <DropdownMenuItem key={column} asChild>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[column as keyof typeof visibleColumns]}
                                            onChange={() => handleToggleColumn(column as keyof typeof visibleColumns)}
                                        />
                                        <span>{column.charAt(0).toUpperCase() + column.slice(1)}</span>
                                    </label>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <input type='text' onChange={handleSearch} placeholder='Search...' />
                </div>

                <div className='flex items-center space-x-2'>
                    <Button onClick={() => setModalOpen(true)}>
                        Office Expense     <IoAddCircle className='mt-1' />
                    </Button>
                    <div className="flex items-center space-x-4">
                        <Button onClick={() => setFilterModalOpen(true)}>
                            <TbFilterSearch />
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                <Table >
                    <TableHeader>
                        <TableRow>
                            {visibleColumns.date && <TableHead onClick={() => requestSort('date')}>
                                <div className='flex justify-between'>
                                    Date {getSortIcon('date')}
                                </div>
                            </TableHead>}
                            {visibleColumns.amount && <TableHead onClick={() => requestSort('amount')}>
                                <div className='flex justify-between'>
                                    Amount {getSortIcon('amount')}
                                </div>
                            </TableHead>}
                            {visibleColumns.expenseType && <TableHead onClick={() => requestSort('expenseType')}>
                                <div className='flex justify-between'>
                                    ExpenseType {getSortIcon('expenseType')}
                                </div>
                            </TableHead>}
                            <TableHead >Payment Mode</TableHead>
                            {visibleColumns.notes && <TableHead onClick={() => requestSort('notes')}>
                                <div className='flex justify-between'>
                                    Notes {getSortIcon('notes')}
                                </div>
                            </TableHead>}
                            {visibleColumns.action && <TableHead >Action</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedExpense.length > 0 ? (
                            sortedExpense.map((expense, index) => (
                                <TableRow key={index} className="border-t hover:bg-indigo-100 cursor-pointer transition-colors">
                                    {visibleColumns.date && <TableCell className="">
                                        <div className='flex items-center space-x-2'>
                                            <FaCalendarAlt className='text-bottomNavBarColor' />
                                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>}
                                    {visibleColumns.amount && <TableCell className="">₹{formatNumber(expense.amount)}</TableCell>}
                                    {visibleColumns.expenseType && <TableCell className="">
                                        <div className="flex items-center space-x-2">
                                            {icons[expense.expenseType as IconKey]}
                                            <span>{expense.expenseType}</span>
                                        </div>
                                    </TableCell>}
                                    {visibleColumns.paymentMode && <TableCell className="">
                                        <div className="flex items-center justify-between">
                                            <p>{expense.paymentMode}</p>
                                            <p className='whitespace-nowrap'>{expense.shopName || "NA"}</p>
                                        </div>
                                    </TableCell>}
                                    {visibleColumns.notes && <TableCell className="">{expense.notes || 'N/A'}</TableCell>}

                                    {visibleColumns.action && <TableCell className="">
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
                                    </TableCell>}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center p-4 text-gray-500">No expenses found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <AddExpenseModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelected(null);
                } }
                onSave={selected ? handleEditExpense : handleAddExpense}
                selected={selected}
                shops={shops} driverId={''}  categories={['Truck Expense', 'Trip Expense', 'Office Expense']}            />
            <ExpenseFilterModal
                isOpen={filterModalOpen}
                shops={shops}
                paymentModes={['Online', 'Cash', 'Credit']}
                handleFilter={handleFilter}
                monthYearOptions={generateMonthYearOptions()}
                onClose={() => setFilterModalOpen(false)}
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
