'use client'
import { toast, useToast } from '@/components/hooks/use-toast'
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



const InvoiceGenerationPage: React.FC = () => {
  const params = useSearchParams()
  const paramtrips = JSON.parse(params.get('trips') as string)
  const router = useRouter()
  const {toast} = useToast()

  const [trips, setTrips] = useState<ITrip[] | any[]>([])
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [deletedPaymentIds, setDeletedPaymentIds] = useState<string[]>([])
  const [deletedChargeIds, setDeletedChargeIds] = useState<string[]>([])
  const [downlaoding, setDownlaoding] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    logoUrl: '',
    billNo: '',
    companyName: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    to: trips[0]?.route?.origin || '',
    from: trips[0]?.route?.destination || '',
    branch: '',
    address: '',
    particulars: '',
    party: trips[0]?.partyName || '',
    freightCharges: [],
    additionalCharges: [],
    partyDetails: {
      msmeNo: trips[0]?.partyDetails?.msmeNo || '',
      gstin: trips[0]?.partyDetails?.gstNumber || '',
      pan: trips[0]?.partyDetails?.pan || '',
      accNo: '',
      ifscCode: '',
      bankName: '',
      bankBranch: ''
    },
    paymentDetails: []
  })

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/trips/invoice?trips=${encodeURIComponent(JSON.stringify(paramtrips))}`)
      const data = await res.json()
      
      setTrips(data.trips)
      setFormData({
        logoUrl: '',
        billNo: '',
        companyName: '',
        email: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        to: trips[0]?.route?.origin || '',
        from: trips[0]?.route?.destination || '',
        branch: '',
        address: '',
        particulars: '',
        party: data.trips[0]?.partyName || '',
        freightCharges: data.trips?.flatMap((trip: any) =>
          trip.tripCharges?.map((charge: any) => ({
            _id: charge._id,
            lrNo: trip.LR || '',
            lorryNo: trip.truck || '',
            particulars: charge.expenseType || '',
            weight: 'FTL',
            charges: 'NA',
            rate: 'Fixed',
            amount: charge.amount?.toString() || '0',
            edited: false
          })) || []
        ) || [],
        additionalCharges: [],
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
            _id: charge._id,
            sNo: index + 1,
            date: charge.date ? new Date(charge.date).toISOString().split('T')[0] : '',
            notes: charge.notes || '',
            paymentMode: charge.paymentType || '',
            amount: charge.amount?.toString() || '0',
            edited: false
          })) || []
        ) || []
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

  if (loading) {
    return <Loading />
  }
  if (!trips) {
    return <div>No Trips Found</div>
  }
  const handleDownload = async () => {
    try {
      setDownlaoding(true);

      // Prepare data once and reuse
      const editedCharges = formData.freightCharges.filter((charge) => charge.edited);
      const editedPayments = formData.paymentDetails.filter((payment) => payment.edited);

      const reqData = {
        newCharges: formData.additionalCharges,
        editedCharges,
        editedPayments,
        deletedChargeIds,
        deletedPaymentIds,
      };

      // Send request to the API
      const res = await fetch(`/api/trips/invoice/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });

      // Handle server response
      if (!res.ok) {
        throw new Error(`Failed to process data: ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Server Response:", data);

      // Generate and download PDF
      if (invoiceRef.current) {
        const padding = 10; // Padding in mm
        const scale = 2; // Scale for better quality
        const canvas = await html2canvas(invoiceRef.current, { scale });
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = canvas.width / scale; // Actual canvas width
        const imgHeight = canvas.height / scale; // Actual canvas height
        const pdfWidth = (imgWidth * 25.4) / 96 + padding * 2; // Convert pixels to mm
        const pdfHeight = (imgHeight * 25.4) / 96 + padding * 2;

        console.log('Calculated PDF dimensions:', pdfWidth, 'x', pdfHeight, 'mm');

        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
        });

        pdf.addImage(
          imgData,
          'JPEG',
          padding,
          padding,
          pdfWidth - padding * 2,
          pdfHeight - padding * 2
        );

        pdf.save(`invoice.pdf`);
        toast({
          description: 'Invoice downloaded successfully.',
        })
        setTimeout(()=>{
          router.push('/user/trips')
        },500)

      }
    } catch (error) {
      console.error("Error in handleDownload:", error);
      toast({
        description: 'Failed to download invoice.',
        variant: 'destructive'
      })
    } finally {
      setDownlaoding(false);
    }
  };


  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-3/5 overflow-y-auto p-4 thin-scrollbar">
        <InvoiceForm trips={trips} formData={formData} setFormData={setFormData} setDeletedChargeIds={setDeletedChargeIds} setDeletedPaymentIds={setDeletedPaymentIds} />
      </div>
      <div className="w-2/5 overflow-y-auto p-4 thin-scrollbar">
        <div ref={invoiceRef}>
          <FreightInvoice formData={formData} />
        </div>
        <div className="mt-4">
          <Button onClick={handleDownload} disabled={downlaoding}>
            <Download className="mr-2 h-4 w-4" /> Download Invoice
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceGenerationPage