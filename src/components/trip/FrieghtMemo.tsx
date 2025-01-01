+'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FMDataType, ITrip } from '@/utils/interface'
import { getBestLogoColor } from '@/utils/imgColor'
import { useToast } from '../hooks/use-toast'
import { FMemo } from '@/utils/DocGeneration'
import 'jspdf/dist/polyfills.es.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { savePDFToBackend } from '@/utils/saveTripDocs'



type Props = {
  isOpen: boolean
  onClose: () => void
  trip: ITrip | any
}

const placeholders: { [key: string]: string } = {
  gstNumber: 'Enter GST Number',
  pan: 'Enter PAN Number',
  companyName: 'Enter Company Name',
  address: 'Enter Full Address',
  city: 'Enter City Name',
  pincode: 'Enter Pincode/ZIP Code',
  contactNumber: 'Enter Contact Number',
  email: 'Enter Email Address',
  date: 'Select Date',
  from: 'Enter Starting Location',
  to: 'Enter Destination Location',
  truckHireCost: 'Enter Truck Hire Cost',
  weight: 'Enter Total Weight of Goods',
  material: 'Enter Material Name',
  unit: 'Enter Unit (e.g., Kg, Tons)',
  noOfBags: 'Enter Number of Bags',
  amount: 'Enter Total Amount',
  advance: 'Enter Advance Amount Paid',
  balance: 'Enter Remaining Balance',
  commision: 'Enter Commission Amount',
  hamali: 'Enter Hamali Charges',
  extraWeight: 'Enter Extra Weight (if any)',
  cashAC: 'Enter Dasti Account Charges',
  extra: 'Enter Extra Charges',
  TDS: 'Enter TDS Amount',
  tyre: 'Enter Tire Charges (if applicable)',
  spareParts: 'Enter Spare Parts Cost (if applicable)',
  truckNo: 'Enter Truck Number',
  logo: 'Upload Company Logo',
  challanNo: 'Enter Challan Number',
  lrdate: 'Enter LR Rec. Date (if applicable)',
};

const steps = [
  {
    title: 'Company Details',
    fields: ['gstNumber', 'pan', 'companyName', 'address', 'city', 'pincode', 'contactNumber', 'email']
  },
  {
    title: 'Frieght Memo Details',
    fields: ['date', 'challanNo', 'lrdate']
  },
  {
    title: 'Trip Details',
    fields: ['from', 'to', 'truckNo', 'truckHireCost', 'material', 'weight', 'unit', 'noOfBags', 'advance', 'hamali', 'commision']
  },
  {
    title: 'Extra Details',
    fields: ['extraWeight', 'cashAC', 'extra', 'TDS', 'tyre', 'spareParts']
  }
]



export default function FrieghtMemo({ isOpen, onClose, trip }: Props) {

  const [currentStep, setCurrentStep] = useState(0)
  const [showBill, setShowBill] = useState(false)
  const [pdfDownloading, setPDFDownloading] = useState(false)
  const [user, setUser] = useState<any>()
  const [payments, setPayments] = useState<any[]>([])
  const [formData, setFormData] = useState<FMDataType>({
    gstNumber: '',
    pan: '',
    companyName: '',
    address: '',
    city: '',
    pincode: '',
    contactNumber: '',
    email: '',
    date: new Date(trip.startDate),
    from: trip.route.origin || '',
    to: trip.route.destination || '',
    truckHireCost: trip.truckHireCost || '',
    weight: trip.weight || '',
    material: trip.material || '',
    vehicleOwner: trip.supplierName || '',
    unit: '',
    billingtype: trip.billingType || '',
    commision: '',
    noOfBags: '',
    advance: '',
    hamali: '',
    extraWeight: '',
    cashAC: '',
    extra: '',
    TDS: '',
    tire: '',
    lrdate: new Date(trip?.dates[2] || Date.now()).toISOString().split('T')[0],
    spareParts: '',
    truckNo: trip.truck || '',
    challanNo: '',
    logo: '',
    signature : ''
  })
  const { toast } = useToast()

  const fetchUser = async () => {
    try {
      const [userRes, paymentsRes] = await Promise.allSettled([
        fetch('/api/users'),
        fetch(`/api/suppliers/${trip.supplier}/payments/trips/${trip.trip_id}`)
      ]);

      // Process user response
      if (userRes.status === 'fulfilled' && userRes.value.ok) {
        const data = await userRes.value.json();
        const user = data.user;
        setUser(user);
        setFormData((prev) => ({
          ...prev,
          companyName: user.company,
          address: user.address,
          contactNumber: user.phone,
          gstNumber: user.gstNumber,
          logo: user.logoUrl,
          pincode: user.pincode,
          email: user.email,
          city: user.city,
          pan: user.panNumber,
          signature : user.signatureUrl
        }));
      } else {
        toast({
          description: 'Failed to fetch user details',
          variant: 'destructive',
        });
      }

      // Process payments response
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        const paymentsData = await paymentsRes.value.json();
        setPayments(paymentsData.supplierAccounts);
        setFormData((prev) => ({
          ...prev,
          advance: paymentsData.totalAmount,
        }));
      } else {
        toast({
          description: 'Failed to fetch payment details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      toast({
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isOpen) fetchUser();
  }, [isOpen])



  


  const downloadAllPDFs = async () => {
    const element = document.getElementById('fmemo');
    if (!element) {
      console.error('Element with id "fmemo" not found');
      return;
    }

    setPDFDownloading(true);
    try {
      console.log('Capturing element as image...');
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: true,
        useCORS: true
      });

      console.log('Canvas generated. Dimensions:', canvas.width, 'x', canvas.height);
      const imgData = canvas.toDataURL('image/jpeg');
      console.log('Image data URL length:', imgData.length);

      const padding = 10; // 10mm padding on all sides
      const imgWidth = canvas.width / 2;
      const imgHeight = canvas.height / 2;
      const pdfWidth = (imgWidth * 25.4) / 96 + (padding * 2);
      const pdfHeight = (imgHeight * 25.4) / 96 + (padding * 2);

      console.log('Calculated PDF dimensions:', pdfWidth, 'x', pdfHeight, 'mm');

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      const imgX = padding;
      const imgY = padding;

      console.log('Adding image to PDF...');
      pdf.addImage(imgData, 'JPEG', imgX, imgY, pdfWidth - (padding * 2), pdfHeight - (padding * 2));

      console.log('Saving PDF...');
      pdf.save(`Challan-${trip.LR}-${formData.truckNo}.pdf`);

      console.log('PDF generation complete');
      const filename = `FM-${trip.LR}-${trip.truck}.pdf`
      await savePDFToBackend(pdf, filename, 'FM/Challan', trip, formData.date)
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setPDFDownloading(false);
    }
    if ((!user.companyName && formData.companyName) || (!user.address && formData.address) || (!user.gstNumber && formData.gstNumber) || (!user.panNumber && formData.pan) || (!user.pincode && formData.pincode) || (!user.city && formData.city) || (!user.email && formData.email)) {
      const data = new FormData()
      data.append('data', JSON.stringify({
        companyName: user.company || formData.companyName,
        address: user.address || formData.address,
        gstNumber: user.gstNumber || formData.gstNumber,
        pincode: user.pincode || formData.pincode,
        email: user.email || formData.email,
        city: user.city || formData.city,
        panNumber: user.panNumber || formData.pan
      }))
      try {
        const res = await fetch('/api/users', {
          method: 'PUT',
          body: data
        })
        if (!res.ok) {
          alert('Failed to update user details')
        }
      } catch (error) {
        alert('Failed to update user details')
      }
    }
  };

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.')
        return { ...prev, [parent]: { ...prev[parent], [child]: value } }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  const progressPercentage = ((currentStep + 1) / steps.length) * 100



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[700px] overflow-y-auto thin-scrollbar"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-semibold text-xl text-black">Frieght Memo</h1>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        {!showBill ? (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <motion.div
                className="bg-lightOrange h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2 gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="col-span-2"
                >
                  <h2 className="text-lg font-semibold text-black mt-2 mb-4">
                    {steps[currentStep].title}
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    {steps[currentStep].fields.map((field: string) => {
                      if (field === "date") {
                        return (
                          <div className="mb-4" key={field}>
                            <Label htmlFor="date">Date</Label>
                            <input
                              id="date"
                              name="date"
                              type="date"
                              value={new Date(formData.date).toISOString().split("T")[0]}
                              onChange={handleInputChange}
                              className="mt-1 w-full p-2 border rounded"
                            />
                          </div>
                        );
                      }


                      return (
                        <div key={field} className="mb-1">
                          <label htmlFor={field} className="text-xs text-gray-500">
                            {placeholders[field]}
                          </label>
                          <Input
                            id={field}
                            name={field}
                            value={formData[field as keyof FMDataType] as string || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-6 col-span-2">
                    {currentStep > 0 && (
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                    )}
                    {currentStep < steps.length - 1 ? (
                      <Button onClick={handleNext}>Next</Button>
                    ) : (
                      <Button onClick={() => setShowBill(true)}>Generate</Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </>
        ) : (
          <div className="w-full">
            <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-b border-gray-200">
              <div className="flex justify-between max-w-5xl mx-auto">
                <Button variant="outline" onClick={() => setShowBill(false)}>
                  Edit Form
                </Button>
                <Button disabled={pdfDownloading} onClick={() => downloadAllPDFs()}>{pdfDownloading ? <Loader2 className='text-white animate-spin' /> : 'Download as PDF'}</Button>
              </div>
            </div>
            <div id='fmemo' className="p-2">
              <FMemo formData={formData} payments={payments} />
            </div>

          </div>
        )}
      </motion.div>
    </motion.div>

  )
}
