'use client'

import React, { useEffect, useMemo } from 'react';
import { FaRegCircleUser } from 'react-icons/fa6';
import { IoNotificationsOutline } from "react-icons/io5";
import Link from 'next/link';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useToast } from '@/components/hooks/use-toast';
import Loading from '../loading';
import { useExpenseCtx } from '@/context/context';
import { useAnimatedNumber } from '@/components/hooks/useAnimatedNumber';
import { RxActivityLog } from "react-icons/rx";
import { useSWRConfig } from 'swr';
import { recentIcons } from '@/utils/icons';
import RecentActivities from '@/components/RecentActivites';


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

const Page = () => {
  const { toast } = useToast()
  const {dashboardData : data, trips, isLoading} = useExpenseCtx()
  const {mutate} = useSWRConfig()


  const totalCost = useMemo(() => {
    return data?.expenses?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0
  }, [data])

  const totalTrip = useMemo(() => {
    return data?.trips?.reduce((acc, curr) => acc + curr.count, 0) || 0
  }, [data])

  const totalRecievable = useMemo(()=>{
    return trips?.reduce((acc,curr)=>acc + curr.balance, 0)
  },[trips])

  const animatedTotalTrip = useAnimatedNumber(totalTrip);
  const animatedTotalCost = useAnimatedNumber(totalCost);
  const animatedTotalReceivable = useAnimatedNumber(totalRecievable);
  const animatedProfit = useAnimatedNumber(data?.profit || 0);

  useEffect(()=>{
    mutate('/api/dashboard')
  },[mutate])

  if (isLoading) {
    return <Loading />
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen">No data available</div>
  }

  return (
    <div className='w-full h-screen bg-gray-50 overflow-hidden'>
      <div className='text-black border-b-2 border-gray-400 flex justify-between p-4'>
        <h1 className='text-2xl font-semibold'>
          Hey!
        </h1>
        <div className='flex items-center gap-4'>
          <IoNotificationsOutline size={30} />
          <Link href={'/user/profile/details'}><FaRegCircleUser size={30} className='font-normal' /></Link>
        </div>
      </div>

      <div className='flex h-[calc(100vh-64px)] thin-scrollbar'>
        <div className='flex-grow overflow-y-auto border-r border-gray-300 p-4'>
          <div className='grid grid-cols-3 gap-4 mb-8'>
            <div className='py-4 text-white bg-bottomNavBarColor text-center rounded-lg shadow-lg flex flex-col gap-2'>
              <p className="text-sm">Total Trips</p>
              <p className='text-2xl font-semibold'>{animatedTotalTrip}</p>
            </div>
            <div className='py-4 text-white bg-bottomNavBarColor text-center rounded-lg shadow-lg flex flex-col gap-2'>
              <p className="text-sm">Total Expenses</p>
              <p className='text-2xl font-semibold'>₹{animatedTotalCost}</p>
            </div>
            <div className='py-4 text-white bg-bottomNavBarColor text-center rounded-lg shadow-lg flex flex-col gap-2'>
              <p className="text-sm">Accounts Receivable</p>
              <p className='text-2xl font-semibold'>₹{animatedTotalReceivable}</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className='bg-white rounded-xl border shadow-md p-4'>
              <h2 className="text-lg font-semibold mb-4">Trips</h2>
              <ChartContainer config={chartConfig} className="h-[300px] w-full" title='Trips per month'>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.trips} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                      fontSize={10}
                    />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill={chartConfig.count.color} radius={[10, 10, 10, 10]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className='bg-white rounded-xl border shadow-md p-4'>
              <h2 className="text-lg font-semibold mb-4">Expenses</h2>
              <ChartContainer
                config={piechartConfig}
                className="mx-auto aspect-square h-[300px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <ChartLegend content={<ChartLegendContent className=' flex flex-col items-start' />} iconSize={25} layout='vertical' align='right' verticalAlign='middle' />
                  <Pie
                    data={data.expenses}
                    dataKey="totalAmount"
                    nameKey="_id"
                    innerRadius={60}
                    outerRadius={100}
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
                                className="fill-foreground text-xl font-bold"
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
              </ChartContainer>
            </div>
          </div>
          
        </div>
        <div className='w-1/4 min-w-[300px] p-4 overflow-y-auto'>
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
    </div>
  );
};

export default Page;