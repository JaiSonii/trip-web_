'use client'

import { useToast } from '@/components/hooks/use-toast'
import { ITrip } from '@/utils/interface'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Loading from '../loading'
import InvoiceForm from '@/components/trip/tripDetail/TripFunctions/InoiveForm'
import FreightInvoice from '@/components/trip/tripDetail/TripFunctions/FrieghtInvoice'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { InvoiceFormData as FormData } from '@/utils/interface'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { loadingIndicator } from '@/components/ui/LoadingIndicator'
import { saveInvoice } from '@/utils/saveTripDocs'
import { useExpenseData } from '@/components/hooks/useExpenseData'

const InvoiceGenerationPage: React.FC = () => {
  const params = useSearchParams()
  const paramtrips = JSON.parse(params.get('trips') as string)
  const party = params.get('party') as string
  const invoiceId = params.get('invoiceId') as string
  const route = JSON.parse(params.get('route') as string)

  const issuedDate = params.get('issuedDate') as string
  const dueDate = params.get('dueDate') as string
  const gst = parseFloat(params.get('gst') as string)


  const router = useRouter()
  const { toast } = useToast()

  const { invoices } = useExpenseData()

  const [trips, setTrips] = useState<ITrip[] | any[]>([])
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef<HTMLDivElement | null>(null)
  const [deletedPaymentIds, setDeletedPaymentIds] = useState<string[]>([])
  const [deletedChargeIds, setDeletedChargeIds] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    logoUrl: '',
    color : '#d1d5db',
    partygst : "",
    partyAddress : "",
    billNo: '',
    companyName: '',
    gst : gst || 0,
    email: '',
    phone: '',
    date: new Date(issuedDate || Date.now()).toISOString().split('T')[0],
    dueDate: new Date(dueDate || Date.now()).toISOString().split('T')[0],
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
        partygst : data.trips[0].partyDetails.gstNumber || "",
        partyAddress : data.trips[0].partyDetails.address || "",
        freightCharges: data.trips?.map((trip: ITrip) => ({
          lrNo: trip.LR,
          truckNo: trip.truck,
          material: trip?.material ? trip.material?.map(item=>item.name) : [],
          date: new Date(trip.startDate).toISOString().split('T')[0],
          weight: trip.guaranteedWeight || 'FTL',
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
      console.log(error)
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
      setDownloading(true);

      // Prepare request data
      const reqData = {
        newCharges: formData.extraAdditionalCharges,
        editedCharges: formData.additionalCharges.filter((charge) => charge.edited),
        editedPayments: formData.paymentDetails.filter((payment) => payment.edited),
        deletedChargeIds,
        deletedPaymentIds,
        newPayments: formData.extraPaymentDetails,
      };

      // Send POST request to process data
      const res = await fetch(`/api/trips/invoice/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });

      if (!res.ok) {
        throw new Error(`Failed to process data: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Server Response:", data);

      // Generate PDF if invoiceRef is available
      if (!invoiceRef.current) throw new Error("Invoice reference not found");

      const scale = 2; // Adjust scale to control resolution
      const canvas = await html2canvas(invoiceRef.current, { scale });
      const imgData = canvas.toDataURL('image/png');

      let pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Fit content to A4 size
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = canvas.width / scale;
      const imgHeight = canvas.height / scale;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      // Add image with compression
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio,);

      // Check file size
      // let pdfBlob = pdf.output('blob');
      // let pdfSizeMB = pdfBlob.size / (1024 * 1024);

      // console.log(`Initial PDF size: ${pdfSizeMB.toFixed(2)} MB`);

      // // Retry with adjustments if size is out of range
      // if (pdfSizeMB > 5) {
      //   // Reduce scale for smaller file
      //   const lowerScale = scale - 0.5;
      //   const lowerCanvas = await html2canvas(invoiceRef.current, { scale: lowerScale });
      //   const lowerImgData = lowerCanvas.toDataURL('image/png');
      //   pdf = new jsPDF({
      //     orientation: 'portrait',
      //     unit: 'mm',
      //     format: 'a4',
      //   });
      //   pdf.addImage(lowerImgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
      //   pdfBlob = pdf.output('blob');
      //   pdfSizeMB = pdfBlob.size / (1024 * 1024);
      // }

      // if (pdfSizeMB < 2) {
      //   throw new Error("PDF size is too small. Please review content or scale.");
      // }

      pdf.save(`${formData.party}-${new Date().toLocaleDateString('en-IN')}-invoice.pdf`);
      toast({ description: 'Invoice downloaded successfully.' });

      // Calculate totals

      const totalFreight = formData.freightCharges.reduce((total, charge)=>total + Number(charge.amount),0)
      const totalAdditionalCharges = formData.additionalCharges.reduce((total, charge)=>total + Number(charge.amount),0) + formData.extraAdditionalCharges.reduce((total, charge)=>total + Number(charge.amount),0)
      const totalPayments = formData.paymentDetails.reduce((total, payment)=>total + Number(payment.amount),0) + formData.extraPaymentDetails.reduce((total, payment)=>total + Number(payment.amount),0) 

      const balance = Number(totalFreight) + Number(totalAdditionalCharges) - Number(totalPayments);


      // Prepare invoice data
      const invData = {
        balance,
        dueDate: new Date(formData.dueDate),
        date: new Date(formData.date),
        invoiceNo: invoices?.length || 1,
        route : {
          origin : route.origin,
          destination : route.destination
        },
        party_id: party,
        gst : formData.gst || 0,
        invoiceStatus: balance === 0 ? 'Paid' : 'Due',
        trips: paramtrips,
        advance: totalPayments,
        total: totalFreight + totalAdditionalCharges,
      };
      await saveInvoice(invData, invoiceId);
      toast({ description: 'Invoice saved successfully.' });

      // Navigate after success
      setTimeout(() => router.push('/user/trips'), 500);

    } catch (error) {
      console.error("Error in handleDownload:", error);
      toast({
        description: 'Failed to download invoice.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };



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
        >

          <div className="h-full flex flex-col">
           
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
                {downloading ? 'Downloading...' : 'Save Invoice'}
              </Button>
            </div>

          </div>
          {/* )} */}
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className={` ${!downloading ? 'hidden' : 'modal-class'}`}>
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

