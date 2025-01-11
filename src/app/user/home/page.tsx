'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaRegCircleUser, FaRoute, FaTruck } from 'react-icons/fa6';
import { IoNotificationsOutline } from "react-icons/io5";
import Link from 'next/link';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useToast } from '@/components/hooks/use-toast';
import Loading from '../loading';
import { useAnimatedNumber } from '@/components/hooks/useAnimatedNumber';
import RecentActivities from '@/components/RecentActivites';
import { useExpenseData } from '@/components/hooks/useExpenseData';
import dynamic from 'next/dynamic';
import { useReminder } from '@/context/reminderContext';
import { Button } from '@/components/ui/button';
import TruckDocumentUpload from '@/components/documents/TruckDocumentUpload';
import TripDocumentUpload from '@/components/documents/TripDocumentUpload';
import DriverDocumentUpload from '@/components/documents/DriverDocumentUpload';
import CompanyDocumentUpload from '@/components/documents/CompanyDocumentUpload';
import OtherDocumentUpload from '@/components/documents/OtherDocumentUpload';
import { motion } from 'framer-motion';
import { PiSteeringWheel } from 'react-icons/pi';
import { X } from 'lucide-react';
import { BiCloudUpload } from 'react-icons/bi';
import { GoOrganization } from 'react-icons/go';
import { useRouter } from 'next/navigation';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { handleAddExpense } from '@/helpers/ExpenseOperation';
import { IExpense } from '@/utils/interface';

const piechartConfig: ChartConfig = {
  totalAmount: {
    label: "Expenses",
    color: "#EA3A88",
  },
  Truck: {
    label: "Truck",
    color: "#5687F2",
  },
  Trip: {
    label: "Trip",
    color: "#60CA3B",
  },
  Office: {
    label: "Office",
    color: "#EA3A88",
  },
}

const chartConfig: ChartConfig = {
  count: {
    label: "Number of Trips :",
    color: "#3190F5",
  },
}

const documentTypes = [
  {
    title: 'Trip Documents',
    link: '/user/documents/tripDocuments',
    icon: <FaRoute className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Driver Documents',
    link: '/user/documents/driverDocuments',
    icon: <PiSteeringWheel className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Lorry Documents',
    link: '/user/documents/truckDocuments',
    icon: <FaTruck className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Company Documents',
    link: '/user/documents/companyDocuments',
    icon: <GoOrganization className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Quick Uploads',
    link: '/user/documents/otherDocuments',
    icon: <BiCloudUpload className='text-bottomNavBarColor' size={40} />
  }
];

const Notification = dynamic(() => import('@/components/Notification'), { ssr: false })
const InvoiceForm = dynamic(() => import('@/components/trip/tripDetail/TripFunctions/InvoiceForm'), { ssr: false, loading: () => <div>{loadingIndicator}</div> })
const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), {
  ssr: false,
  loading: () => <div>{loadingIndicator}</div>
})

const Page = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { dashboardData: data, trips, isLoading, refetchDashboard } = useExpenseData()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationIconRef = useRef<HTMLDivElement>(null);
  const { reminders } = useReminder()
  const [open, setOpen] = useState(false)
  const [tripOpen, setTripOpen] = useState(false);
  const [truckOpen, setTruckOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [InvoiceOpen, setInvoiceOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false)

  const totalCost = useMemo(() => {
    return data?.expenses?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0
  }, [data])

  const totalTrip = useMemo(() => {
    return data?.trips?.reduce((acc, curr) => acc + curr.count, 0) || 0
  }, [data])

  const totalRecievable = useMemo(() => {
    return trips?.reduce((acc, curr) => acc + curr.balance, 0)
  }, [trips])

  const animatedTotalTrip = useAnimatedNumber(totalTrip);
  const animatedTotalCost = useAnimatedNumber(totalCost);
  const animatedTotalReceivable = useAnimatedNumber(totalRecievable);
  const animatedProfit = useAnimatedNumber(data?.profit || 0);


  const openModal = (title: string) => {
    setOpen(false)
    switch (title) {
      case 'Trip Documents':
        setTripOpen(!tripOpen);
        break;
      case 'Truck Documents':
        setTruckOpen(!truckOpen);
        break;
      case 'Driver Documents':
        setDriverOpen(!driverOpen);
        break;
      case 'Company Documents':
        setCompanyOpen(!companyOpen);
        break;
      case 'Quick Uploads':
        setOtherOpen(!otherOpen);
        break;
      default:
        break;
    }
  }

  const handleExpense = async (expense: IExpense | any, id?: string, file?: File | null) => {
    try {
      const data = await handleAddExpense(expense, file, toast)

      toast({
        description: `Expense added successfully`
      })
    } catch (error) {
      toast({
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setExpenseOpen(false);
    }
  };


  useEffect(() => {
    refetchDashboard()
  }, [refetchDashboard])

  if (isLoading) {
    return <Loading />
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen">No data available</div>
  }

  return (
    <div className='w-full h-screen bg-gray-50 overflow-hidden flex flex-col'>
      <div className='text-black border-b-2 border-gray-400 flex justify-between p-4 lg:px-8 lg:py-2'>
        <h1 className='text-2xl font-semibold'>
          Hey!
        </h1>
        <div className='flex items-center gap-4'>
          <div ref={notificationIconRef} className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              <IoNotificationsOutline size={24} />
              {reminders?.tripReminders?.length + reminders?.truckReminders?.length + reminders?.driverReminders?.length > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {reminders?.tripReminders?.length + reminders?.truckReminders?.length + reminders?.driverReminders?.length}
                </span>
              )}
            </button>
            <Notification
              tripReminders={reminders?.tripReminders || []}
              truckReminders={reminders?.truckReminders || []}
              driverReminders={reminders?.driverReminders || []}
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>
          <Link href={'/user/profile/details'}>
            <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors duration-200">
              <FaRegCircleUser size={24} className='font-normal' />
            </div>
          </Link>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden'>
        <div className='flex-grow overflow-y-auto border-r border-gray-300 p-4 lg:p-10 lg:py-2 no-scrollbar'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8'>
            <div className='py-3 text-white bg-bottomNavBarColor text-center rounded-xl shadow-lg flex flex-col gap-2'>
              <p className="text-sm">Total Trips</p>
              <p className='text-2xl font-semibold'>{animatedTotalTrip}</p>
            </div>
            <div className='py-3 text-white bg-bottomNavBarColor text-center rounded-xl shadow-lg flex flex-col gap-2'>
              <p className="text-sm">Total Expenses</p>
              <p className='text-2xl font-semibold'>₹{animatedTotalCost}</p>
            </div>
            <div className='py-3 text-white bg-bottomNavBarColor text-center rounded-xl shadow-lg flex flex-col gap-2'>
              <p className="text-sm">Accounts Receivable</p>
              <p className='text-2xl font-semibold'>₹{animatedTotalReceivable}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className='bg-white rounded-xl border shadow-md p-4'>
              <h2 className="text-lg font-semibold mb-4">Trips</h2>
              <ChartContainer config={chartConfig} className="h-[200px] w-full" title='Trips per month'>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.trips} barSize={15} margin={{left : -20,right : 10}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="monthYear"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                      fontSize={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={false}/>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill={chartConfig.count.color} radius={[8, 8, 8, 8]} width={5}/>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className='bg-white rounded-xl border shadow-md p-4'>
              <h2 className="text-lg font-semibold mb-4">Expenses</h2>
              <ChartContainer
                config={piechartConfig}
                className="mx-auto aspect-square h-[200px] w-full "
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <ChartLegend content={<ChartLegendContent className='flex flex-col items-start lg:items-end' />} iconSize={25} layout='vertical' align='right' verticalAlign='middle' />
                    <Pie
                      data={data.expenses}
                      dataKey="totalAmount"
                      nameKey="_id"
                      innerRadius="60%"
                      outerRadius="100%"
                      paddingAngle={2}
                    >
                      {data?.expenses?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={piechartConfig[entry._id as keyof typeof piechartConfig]?.color || piechartConfig.totalAmount.color}
                        />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-xl font-semibold"
                                >
                                  ₹{totalCost.toLocaleString('en-IN')}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Total Expense
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

          </div>
          <div className='grid gap-8 lg:grid-cols-4 mt-8 py-4 border-b-2 border-gray-200'>
            <Button onClick={() => router.replace('/user/trips/create')}>
              Add Trip
            </Button>
            <Button onClick={() => setOpen(true)}>
              Add Document
            </Button>
            <Button onClick={()=>setExpenseOpen(true)}>
              Add Expense
            </Button>
            <Button onClick={() => setInvoiceOpen(true)}>
              Generate Invoice
            </Button>
          </div>
        </div>
        <div className='w-full lg:w-1/4 lg:min-w-[300px] p-4 lg:p-8 overflow-y-auto'>
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <div className='border-2 border-gray-300 rounded-xl p-4 bg-white shadow-md'>
            <div className='flex items-center justify-between text-sm text-gray-500 mb-2'>
              <p>Your Profit</p>
              <p>{new Date(Date.now()).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
              })}</p>
            </div>
            <p className='text-3xl font-semibold'>₹{animatedProfit}</p>
          </div>
          <div className='mt-8'>
            <h3 className='font-semibold text-lg mb-2'>
              Recent Activities
            </h3>
            <RecentActivities data={data} />
          </div>
        </div>
      </div>
      {
        open &&
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Select Document Type</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-6">
              {documentTypes.map(({ title, icon }) => (
                <Button
                  key={title}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => openModal(title)}
                >
                  {/* Replace with your actual icon component */}
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-sm font-medium">{title.split(' ')[0]}</p>
                </Button>
              ))}
            </div>


          </motion.div>

        </div>
      }
      <TruckDocumentUpload open={truckOpen} setOpen={setTruckOpen} />



      <TripDocumentUpload open={tripOpen} setOpen={setTripOpen} />


      <DriverDocumentUpload open={driverOpen} setOpen={setDriverOpen} />


      <CompanyDocumentUpload open={companyOpen} setOpen={setCompanyOpen} />


      <OtherDocumentUpload open={otherOpen} setOpen={setOtherOpen} />
      <InvoiceForm open={InvoiceOpen} setOpen={setInvoiceOpen} />
      <AddExpenseModal
        isOpen={expenseOpen}
        onClose={() => {
          setExpenseOpen(false);
        }}
        driverId=''
        onSave={handleExpense}
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']}

      />
    </div>
  );
};

export default Page;

