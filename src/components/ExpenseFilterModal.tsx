'use client'
import { IDriver, ITrip, TruckModel } from '@/utils/interface'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { fuelAndDriverChargeTypes, maintenanceChargeTypes, officeExpenseTypes } from '@/utils/utilArray'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

type Props = {
    monthYearOptions: string[]
    paymentModes: string[]
    onClose: () => void
    isOpen: boolean // Modal open state
    trucks?: TruckModel[]
    trips?: ITrip[]
    drivers?: IDriver[]
    shops: any[]
    handleFilter: (filter: any) => void
}



const ExpenseFilterModal: React.FC<Props> = ({ onClose, isOpen, monthYearOptions, paymentModes, handleFilter, trips, trucks, shops, drivers }) => {
    const pathname = usePathname()
    let ulOptions = ['Trucks', 'Month and Year', 'Expense Type', 'Driver', 'Shop', 'Payment Mode']
    pathname === '/user/expenses/tripExpense' ? ulOptions.push('Trips') : null
    pathname === '/user/expenses/officeExpense' ? ulOptions = ['Month and Year', 'Expense Type','Shop', 'Payment Mode'] : null

    let expenseTypes = []
    if(pathname === '/user/expenses/tripExpense'){
        expenseTypes = Array.from(fuelAndDriverChargeTypes)
    }else if(pathname === '/user/expenses/truckExpense'){
        expenseTypes = Array.from(maintenanceChargeTypes)
    }else{
        expenseTypes = Array.from(officeExpenseTypes)
    }

    // States for selected filters
    const [selectedTrucks, setSelectedTrucks] = useState<string[]>([])
    const [selectedMonthYears, setSelectedMonthYears] = useState<string[]>([])
    const [selectedPaymentModes, setSelectedPaymentModes] = useState<string[]>([])
    const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])
    const [selectedShops, setSelectedShops] = useState<string[]>([])
    const [selectedTrips, setSelectedTrips] = useState<string[]>([])
    const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])

    const [render, setRender] = useState('Month and Year')




    // Handler functions to update states for checkboxes
    const handleTruckChange = (truckNo: string) => {
        setSelectedTrucks(prev =>
            prev.includes(truckNo)
                ? prev.filter(truck => truck !== truckNo)
                : [...prev, truckNo]
        )
    }

    const handleDriverChange = (driverId: string) => {
        setSelectedDrivers(prev =>
            prev.includes(driverId)
                ? prev.filter(driver => driver !== driverId)
                : [...prev, driverId]
        )
    }

    const handleShopChange = (shopId: string) => {
        setSelectedShops(prev =>
            prev.includes(shopId)
                ? prev.filter(shop => shop !== shopId)
                : [...prev, shopId]
        )
    }

    const handleTripChange = (tripId: string) => {
        setSelectedTrips(prev =>
            prev.includes(tripId)
                ? prev.filter(trip => trip !== tripId)
                : [...prev, tripId]
        )
    }

    const handleExpenseChange = (expense: string) => {
        setSelectedExpenses(prev =>
            prev.includes(expense)
                ? prev.filter(expense => expense !== expense)
                : [...prev, expense]
        )
    }

    const handleMonthYearChange = (monYear: string) => {
        setSelectedMonthYears(prev =>
            prev.includes(monYear)
                ? prev.filter(monthYear => monthYear !== monYear)
                : [...prev, monYear]
        )
    }

    const handlePaymentModeChange = (mode: string) => {
        setSelectedPaymentModes(prev =>
            prev.includes(mode)
                ? prev.filter(paymentMode => paymentMode !== mode)
                : [...prev, mode]
        )
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0, 0.71, 0.2, 1.01]
                }} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[800px]">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-lg font-semibold">Expense Filter</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>

                {/* Modal Body */}
                <div className="space-y-4 grid grid-cols-3">


                    <div className='col-span-1 border-r-2 border-gray-300 px-4'>

                        <ul className='flex flex-col space-y-2'>
                            {ulOptions.map((option, index) => (
                                <li key={index} onClick={() => setRender(option)} className={`p-4 text-black font-normal text-lg hover:bg-hoverColor cursor-pointer border-b-2 border-gray-200 rounded-lg ${render === option ? 'bg-lightOrange' : ''}`}>
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='col-span-2'>
                        {pathname !== '/user/expenses/officeExpense' && trucks && render === 'Trucks' && (
                            <div className='relative h-full overflow-auto p-4 text-black font-normal text-lg'>
                                {trucks.map(truck => (
                                    <div key={truck.truckNo} className="flex items-center space-x-2 border-b-2 border-gray-200">
                                        <input
                                            type="checkbox"
                                            value={truck.truckNo}
                                            checked={selectedTrucks.includes(truck.truckNo)}
                                            onChange={() => handleTruckChange(truck.truckNo)}
                                            className="accent-bottomNavBarColor hover:accent-opacity-80"
                                        />
                                        <label >{truck.truckNo}</label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {monthYearOptions && render === 'Month and Year' && (
                            <>
                                <div className='relative max-h-[400px] overflow-auto text-black font-normal text-lg p-4'>

                                    {monthYearOptions.map((monYear, index) => (
                                        <div key={index} className="flex items-center space-x-2 border-b-2 border-gray-200">
                                            <input
                                                type="checkbox"
                                                value={monYear}
                                                checked={selectedMonthYears.includes(monYear)}
                                                onChange={() => handleMonthYearChange(monYear)}
                                                className="accent-bottomNavBarColor hover:accent-opacity-80"
                                            />
                                            <label >{monYear}</label>
                                        </div>
                                    ))}
                                </div></>

                        )}

                        {paymentModes && render === 'Payment Mode' && (
                            <div className='relative max-h-[400px] overflow-auto text-black font-normal text-lg p-4'>
                                {paymentModes.map((mode, index) => (
                                    <div key={index} className="flex items-center space-x-2 border-b-2 border-gray-200">
                                        <input
                                            type="checkbox"
                                            value={mode}
                                            checked={selectedPaymentModes.includes(mode)}
                                            onChange={() => handlePaymentModeChange(mode)}
                                            className="accent-bottomNavBarColor hover:accent-opacity-80"
                                        />
                                        <label htmlFor={`paymentMode-${index}`}>
                                            {mode}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {pathname !== '/user/expenses/officeExpense' && drivers && render === 'Driver' && (
                            <div className='relative max-h-[400px] overflow-auto p-4 text-black font-normal text-lg'>
                                {drivers.map(driver => (
                                    <div key={driver.driver_id} className="flex items-center space-x-2 border-b-2 border-gray-200">
                                        <input
                                            type="checkbox"
                                            value={driver.driver_id}
                                            checked={selectedDrivers.includes(driver.driver_id)}
                                            onChange={() => handleDriverChange(driver.driver_id)}
                                            className="accent-bottomNavBarColor hover:accent-opacity-80"
                                        />
                                        <label >{driver.name} • {driver.contactNumber}</label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {shops && render === 'Shop' && (
                            <div className='relative max-h-[400px] overflow-auto p-4 text-black font-normal text-lg'>
                                {shops.map(shop => (
                                    <div key={shop.shop_id} className="flex items-center space-x-2 border-b-2 border-gray-200">
                                        <input
                                            type="checkbox"
                                            value={shop.shop_id}
                                            checked={selectedShops.includes(shop.shop_id)}
                                            onChange={() => handleShopChange(shop.shop_id)}
                                            className="accent-bottomNavBarColor hover:accent-opacity-80"
                                        />
                                        <label >{shop.name} </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {pathname === '/user/expenses/tripExpense' && trips && render === 'Trips' && (
                            <div className='relative max-h-[400px] overflow-auto p-4 text-black font-normal text-lg'>
                                {trips.map(trip => (
                                    <div key={trip.trip_id} className="flex items-center space-x-2 border-b-2 border-gray-200">
                                        <input
                                            type="checkbox"
                                            value={trip.trip_id}
                                            checked={selectedTrips.includes(trip.trip_id)}
                                            onChange={() => handleTripChange(trip.trip_id)}
                                            className="accent-bottomNavBarColor hover:accent-opacity-80"
                                        />
                                        <label className='whitespace-nowrap'>{trip.LR} • {trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]} • {trip.truck}</label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {render === 'Expense Type' && (
                            <div className='relative max-h-[400px] overflow-auto p-4 text-black font-normal text-lg'>
                                {expenseTypes.map((expense, index) => (
                                    <div key={index} className="flex items-center space-x-2 border-b-2 border-gray-200">
                                        <input
                                            type="checkbox"
                                            value={expense}
                                            checked={selectedExpenses.includes(expense)}
                                            onChange={() => handleExpenseChange(expense)}
                                            className="accent-bottomNavBarColor hover:accent-opacity-80"
                                        />
                                        <label className='whitespace-nowrap'>{expense}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant={'outline'}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleFilter({
                                trucks: selectedTrucks,
                                monthYear: selectedMonthYears,
                                paymentModes: selectedPaymentModes,
                                drivers: selectedDrivers,
                                trips: selectedTrips,
                                shops: selectedShops,
                                expenseTypes: selectedExpenses
                            })
                            onClose()
                        }}
                    >
                        Apply Filters
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

export default ExpenseFilterModal
