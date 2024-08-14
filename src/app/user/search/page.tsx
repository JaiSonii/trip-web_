'use client';
import DriverName from '@/components/driver/DriverName';
import PartyName from '@/components/party/PartyName';
import TripRoute from '@/components/trip/TripRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { statuses } from '@/utils/schema';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

const SearchPage = () => {
    const [query, setQuery] = useState(''); // State to manage the search query
    const [results, setResults] = useState<any>({}); // State to store the search results
    const [error, setError] = useState<string | null>(null); // State to handle errors
    const [loading, setLoading] = useState(false); // State to manage loading state
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce the search input to minimize API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500); // Adjust the debounce delay as needed

        return () => {
            clearTimeout(timer);
        };
    }, [query]);

    // Function to handle the search request
    useEffect(() => {
        const handleSearch = async () => {
            if (!debouncedQuery) return;

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }
                const data = await response.json();
                setResults(data); // Update the results state with the data received from the server
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        handleSearch();
    }, [debouncedQuery]);

    // Function to handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDebouncedQuery(query);
    };

    return (
        <div className='container flex flex-col space-y-3 bg-gray-300 rounded-md min-h-screen p-4'>
            <h1 className='text-bottomNavBarColor text-3xl'>Search Page</h1>
            <form onSubmit={handleSubmit} className='flex items-center space-x-2'>
                <Input
                    type='text'
                    placeholder='Search...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className='p-2 rounded-md border border-gray-400'
                />
                <Button type='submit'>Search</Button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p className='text-red-500'>{error}</p>}

            <motion.div
                className='results flex flex-col space-y-4 mt-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {Object.keys(results).length > 0 ? (
                    <>
                        {/* Parties */}
                        {results.parties && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Parties</h2>
                                {results.parties.length > 0 ? (
                                    results.parties.map((party: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Name:</strong> {party.name}</p>
                                            <p><strong>Contact Person:</strong> {party.contactPerson}</p>
                                            <p><strong>Contact Number:</strong> {party.contactNumber}</p>
                                            <p><strong>Address:</strong> {party.address}</p>
                                            <p><strong>GST Number:</strong> {party.gstNumber}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No parties found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Trips */}
                        {results.trips && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Trips</h2>
                                {results.trips.length > 0 ? (
                                    results.trips.map((trip: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Party:</strong> <PartyName partyId={trip.party}/></p>
                                            <p><strong>Truck:</strong> {trip.truck}</p>
                                            <p><strong>Driver:</strong> <DriverName driverId={trip.driver} /></p>
                                            <p><strong>Route:</strong> {trip.route.origin} to {trip.route.destination}</p>
                                            <p><strong>Billing Type:</strong> {trip.billingType}</p>
                                            <p><strong>Amount:</strong> {trip.amount}</p>
                                            <p><strong>Status:</strong> {statuses[trip.status]}</p>
                                            <p><strong>Notes:</strong> {trip.notes}</p>
                                            
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No trips found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Drivers */}
                        {results.drivers && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Drivers</h2>
                                {results.drivers.length > 0 ? (
                                    results.drivers.map((driver: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Name:</strong> {driver.name}</p>
                                            <p><strong>Contact Number:</strong> {driver.contactNumber}</p>
                                            <p><strong>Status:</strong> {driver.status}</p>
                                            <p><strong>Balance:</strong> {driver.balance}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No drivers found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Trucks */}
                        {results.trucks && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Trucks</h2>
                                {results.trucks.length > 0 ? (
                                    results.trucks.map((truck: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Truck No:</strong> {truck.truckNo}</p>
                                            <p><strong>Truck Type:</strong> {truck.truckType}</p>
                                            <p><strong>Model:</strong> {truck.model}</p>
                                            <p><strong>Status:</strong> {truck.status}</p>
                                            <p><strong>Capacity:</strong> {truck.capacity}</p>
                                            <p><strong>Length:</strong> {truck.bodyLength}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No trucks found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Suppliers */}
                        {results.suppliers && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Suppliers</h2>
                                {results.suppliers.length > 0 ? (
                                    results.suppliers.map((supplier: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Name:</strong> {supplier.name}</p>
                                            <p><strong>Contact Number:</strong> {supplier.contactNumber}</p>
                                            <p><strong>Balance:</strong> {supplier.balance}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No suppliers found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Expenses */}
                        {results.expenses && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Expenses</h2>
                                {results.expenses.length > 0 ? (
                                    results.expenses.map((expense: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Type:</strong> {expense.type}</p>
                                            <p><strong>Amount:</strong> {expense.amount}</p>
                                            <p><strong>Date:</strong> {expense.date}</p>
                                            <p><strong>Truck:</strong> {expense.truck}</p>
                                             <p><strong>Trip:</strong> <TripRoute tripId={expense.trip_id}/></p>
                                             <p><strong>Notes:</strong> {expense.notes}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No expenses found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Supplier Accounts */}
                        {results.supplierAccounts && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Supplier Accounts</h2>
                                {results.supplierAccounts.length > 0 ? (
                                    results.supplierAccounts.map((account: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Name:</strong> {account.name}</p>
                                            <p><strong>Contact Number:</strong> {account.contactNumber}</p>
                                            <p><strong>Balance:</strong> {account.balance}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No supplier accounts found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Office Expenses */}
                        {results.officeExpenses && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Office Expenses</h2>
                                {results.officeExpenses.length > 0 ? (
                                    results.officeExpenses.map((expense: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Type:</strong> {expense.type}</p>
                                            <p><strong>Amount:</strong> {expense.amount}</p>
                                            <p><strong>Date:</strong> {expense.date}</p>
                                            <p><strong>Notes:</strong> {expense.notes}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No office expenses found.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Trip Charges */}
                        {results.tripCharges && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className='text-xl font-semibold'>Trip Charges</h2>
                                {results.tripCharges.length > 0 ? (
                                    results.tripCharges.map((charge: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            className='p-3 bg-white rounded-md shadow-md'
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <p><strong>Truck:</strong> {charge.truck}</p>
                                            <p><strong>Driver:</strong> <DriverName driverId={charge.driver} /></p>
                                            <p><strong>Amount:</strong> {charge.amount}</p>
                                            <p><strong>Charge Type:</strong> {charge.expenseType}</p>
                                            <p><strong>Notes:</strong> {charge.notes}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p>No trip charges found.</p>
                                )}
                            </motion.div>
                        )}
                    </>
                ) : (
                    <p>No results found.</p>
                )}
            </motion.div>
        </div>
    );
};

export default SearchPage;
