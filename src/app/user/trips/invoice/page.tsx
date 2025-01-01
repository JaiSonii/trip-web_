'use client'

import { toast, useToast } from '@/components/hooks/use-toast'
import { ITrip } from '@/utils/interface'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Loading from '../loading'
import InvoiceForm from '@/components/trip/tripDetail/TripFunctions/InoiveForm'
import FreightInvoice from '@/components/trip/tripDetail/TripFunctions/FrieghtInvoice'
import { Button } from '@/components/ui/button'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { InvoiceFormData as FormData } from '@/utils/interface'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { loadingIndicator } from '@/components/ui/LoadingIndicator'

const InvoiceGenerationPage: React.FC = () => {
  const params = useSearchParams()
  const paramtrips = JSON.parse(params.get('trips') as string)
  const router = useRouter()
  const { toast } = useToast()

  const [trips, setTrips] = useState<ITrip[] | any[]>([])
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef<HTMLDivElement | null>(null)
  const [deletedPaymentIds, setDeletedPaymentIds] = useState<string[]>([])
  const [deletedChargeIds, setDeletedChargeIds] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    logoUrl: '',


    billNo: '',
    companyName: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    to: '',
    from: '',
    branch: '',
    address: '',
    particulars: '',
    signatureUrl: '',
    stampUrl: '',
    party: '',
    freightCharges: [],
    additionalCharges: [],
    partyDetails: {
      msmeNo: '',
      gstin: '',
      pan: '',
      accNo: '',
      ifscCode: '',
      bankName: '',
      bankBranch: ''
    },
    paymentDetails: [],
    extraAdditionalCharges: [],
    extraPaymentDetails: []
  })

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/trips/invoice?trips=${encodeURIComponent(JSON.stringify(paramtrips))}`)
      const data = await res.json()

      setTrips(data.trips)
      setFormData({
        ...formData,
        to: data.trips[0]?.route?.origin || '',
        from: data.trips[0]?.route?.destination || '',
        party: data.trips[0]?.partyName || '',
        freightCharges: data.trips?.map((trip: ITrip) => ({
          lrNo: trip.LR,
          truckNo: trip.truck,
          material: trip.material,
          date: new Date(trip.startDate).toISOString().split('T')[0],
          weight: trip.weight || 'FTL',
          charged: trip.units || '',
          rate: trip.rate || 'Fixed',
          amount: trip.amount
        })),
        additionalCharges: data.trips?.flatMap((trip: any) =>
          trip.tripCharges?.map((charge: any, index: number) => ({
            id: charge._id,
            sNo: index + 1,
            date: charge.date ? new Date(charge.date).toISOString().split('T')[0] : '',
            notes: charge.notes || '',
            expenseType: charge.expenseType || '',
            amount: charge.amount,
            edited: false
          })) || []
        ) || [],
        partyDetails: {
          msmeNo: data.trips[0]?.partyDetails?.msmeNo || '',
          gstin: data.trips[0]?.partyDetails?.gstNumber || '',
          pan: data.trips[0]?.partyDetails?.pan || '',
          accNo: '',
          ifscCode: '',
          bankName: '',
          bankBranch: ''
        },
        paymentDetails: data.trips?.flatMap((trip: any) =>
          trip.tripAccounts?.map((charge: any, index: number) => ({
            id: charge._id,
            sNo: index + 1,
            date: charge.date ? new Date(charge.date).toISOString().split('T')[0] : '',
            notes: charge.notes || '',
            paymentType: charge.paymentType || '',
            amount: charge.amount,
            edited: false
          })) || []
        ) || [],
      })
    } catch (error) {
      toast({
        description: 'Failed to fetch trips. Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDownload = async () => {
    try {
      setDownloading(true)

      const editedCharges = formData.additionalCharges.filter((charge) => charge.edited)
      const editedPayments = formData.paymentDetails.filter((payment) => payment.edited)

      const reqData = {
        newCharges: formData.extraAdditionalCharges,
        editedCharges,
        editedPayments,
        deletedChargeIds,
        deletedPaymentIds,
        newPayments: formData.extraPaymentDetails
      }

      const res = await fetch(`/api/trips/invoice/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      })

      if (!res.ok) {
        throw new Error(`Failed to process data: ${res.statusText}`)
      }
      const data = await res.json()
      console.log("Server Response:", data)

      if (invoiceRef.current) {
        const scale = 2
        const canvas = await html2canvas(invoiceRef.current, { scale })
        const imgData = canvas.toDataURL('image/png')

        // A4 size in mm
        const pdfWidth = 210
        const pdfHeight = 297

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })

        // Calculate scaling to fit content to A4
        const imgWidth = canvas.width / scale
        const imgHeight = canvas.height / scale
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = (pdfHeight - imgHeight * ratio) / 2

        pdf.addImage(
          imgData,
          'PNG',
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio
        )

        pdf.save(`${formData.party}-${new Date(Date.now()).toLocaleDateString('en-IN')}-invoice.pdf`)
        toast({
          description: 'Invoice downloaded successfully.',
        })
        setTimeout(() => {
          router.push('/user/trips')
        }, 500)
      }
    } catch (error) {
      console.error("Error in handleDownload:", error)
      toast({
        description: 'Failed to download invoice.',
        variant: 'destructive'
      })
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!trips) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Trips Found</h2>
          <Button onClick={() => router.push('/user/trips')}>Back to Trips</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* <div className="bg-primary text-primary-foreground p-4 flex justify-end">
        <Button onClick={() => router.push('/user/trips')} variant="secondary">
          Back to Trips
        </Button>
      </div> */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow"
      >
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full overflow-y-auto p-4 thin-scrollbar">
            <InvoiceForm
              trips={trips}
              formData={formData}
              setFormData={setFormData}
              setDeletedChargeIds={setDeletedChargeIds}
              setDeletedPaymentIds={setDeletedPaymentIds}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={40}
          minSize={20}
        maxSize={60}
        collapsible={true}
        collapsedSize={0}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        //className={cn(
        //  "transition-all duration-300 ease-in-out",
        //  isCollapsed ? "min-w-[50px] md:min-w-[70px]" : ""
        //)}
        >
          
          <div className="h-full flex flex-col">
            {/* <div className="flex justify-end items-center p-4 bg-secondary">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(true)}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Collapse invoice preview</span>
                </Button>
              </div> */}
            <div className="flex-grow overflow-y-auto p-4 thin-scrollbar">
              <div>
                <FreightInvoice formData={formData} />
              </div>
            </div>
            <div className="p-4">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Downloading...' : 'Download Invoice'}
              </Button>
            </div>

          </div>
          {/* )} */}
        </ResizablePanel>
      </ResizablePanelGroup>
      
        <div  className={` ${!downloading ? 'hidden' : 'modal-class'}`}>
          {
            <div className='z-50 fixed flex items-center justify-center modal-class text-white'>
              {loadingIndicator}
              <p>downloading pdf...</p>
            </div>
          }
          <div className='bg-white max-w-lg' ref={invoiceRef}>
            <FreightInvoice formData={formData} />
          </div>

        </div>
      

    </div>
  )
}

export default InvoiceGenerationPage

