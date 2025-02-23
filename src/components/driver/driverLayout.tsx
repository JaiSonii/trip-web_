"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, FileText, Pencil, Truck, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { formatNumber } from "@/utils/utilArray"
import type { IDriver } from "@/utils/interface"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import Loading from "@/app/user/loading"
import { useDriver } from "@/context/driverContext"
import dynamic from "next/dynamic"

interface DriverLayoutProps {
  driverId: string
  onDriverUpdate: (driver: IDriver) => void
  children: React.ReactNode
}

const DriverModal = dynamic(()=>import('@/components/driver/driverModal'),{ssr : false})
const EditDriverModal = dynamic(()=>import('@/components/driver/editDriverModal'),{ssr : false})

export default function DriverLayout({ driverId, onDriverUpdate, children }: DriverLayoutProps) {
  const { driver, loading } = useDriver()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"gave" | "got" | null>(null)
  const [edit, setEdit] = useState(false)
  const pathname = usePathname()

  const tabs = [
    { icon: <Truck className="h-4 w-4" />, name: "Driver Accounts", path: `/user/drivers/${driverId}` },
    { icon: <Calendar className="h-4 w-4" />, name: "Trips", path: `/user/drivers/${driverId}/trips` },
    { icon: <FileText className="h-4 w-4" />, name: "Documents", path: `/user/drivers/${driverId}/documents` },
  ]

  if (loading) return <Loading />
  if (!driver) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Driver not found</div>
  }

  return (
    <div className="">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{driver.name}</h1>
              <span className={`text-sm px-3 py-1 rounded-full ${driver.status === 'On Trip' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{driver?.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalOpen(true)
                  setModalType("got")
                }}
              >
                Got Money
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalOpen(true)
                  setModalType("gave")
                }}
              >
                Gave Money
              </Button>
              <Button variant={'ghost'} onClick={()=>setEdit(true)}>
                <Pencil size={15}/>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="font-medium text-foreground">Contact</div>
                {driver.contactNumber}
              </div>
              <div>
                <div className="font-medium text-foreground">License No</div>
                {driver.licenseNo}
              </div>
              <div>
                <div className="font-medium text-foreground">Aadhar No</div>
                {driver.aadharNo}
              </div>
              <div>
                <div className="font-medium text-foreground">Last Joining</div>
                {new Date(driver.lastJoiningDate).toLocaleDateString("en-IN")}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-lg">
              <span className="font-medium">Balance:</span>
              <span className={driver.balance >= 0 ? "text-success" : "text-destructive"}>
                ₹{formatNumber(Math.abs(driver.balance))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex border-b-2 border-lightOrange mb-4 mt-2 overflow-x-auto">
        {tabs.map((tab) => (
          <a
            key={tab.name}
            href={tab.path}
            className={`px-4 py-2 font-semibold rounded-t-md transition-all duration-300 ${pathname === tab.path ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange' : 'hover:bg-lightOrangeButtonColor'}`}
          >
            <div className="flex items-center space-x-2">{tab.icon}<span>{tab.name}</span></div>
          </a>
        ))}
      </div>

      <div className="mt-4">{children}</div>

      <DriverModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onConfirm={() => console.log("Confirm action")}
      />

      {edit && (
        <EditDriverModal
          driverId={driverId}
          onCancel={() => setEdit(false)}
          handleEdit={() => console.log("Edit Driver")}
          name={driver.name}
          contactNumber={driver.contactNumber}
        />
      )}
    </div>
  )
}

