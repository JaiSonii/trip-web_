'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ITrip, PaymentBook } from '@/utils/interface'
import generatePDF from 'react-to-pdf';
import Image from 'next/image'
import { getBestLogoColor } from '@/utils/imgColor'
import { formatNumber } from '@/utils/utilArray'
import logo from '@/assets/awajahi logo.png'
import { useToast } from '../hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '@radix-ui/react-select'
import { Table, TableBody, TableRow, TableCell } from '../ui/table'



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
  lrdate : 'Enter LR Rec. Date (if applicable)',
};


interface FormDataType {
  gstNumber: string;
  pan: string;
  companyName: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
  email: string;
  date: Date;
  challanNo: string
  from: string;
  to: string;
  truckHireCost: string;
  commision: string;
  weight: string;
  material: string;
  unit: string;
  noOfBags: string;
  vehicleOwner : string;
  advance: string;
  hamali: string;
  extraWeight: string;
  billingtype: string;
  cashAC: string;
  extra: string;
  TDS: string;
  tire: string;
  spareParts: string;
  truckNo: string;
  lrdate : string
  logo: string;
}


const steps = [
  {
    title: 'Company Details',
    fields: ['gstNumber', 'pan', 'companyName', 'address', 'city', 'pincode', 'contactNumber', 'email']
  },
  {
    title: 'Frieght Memo Details',
    fields: ['date', 'challanNo','lrdate']
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
  const [selectedCopy, setSelectedCopy] = useState('Consigner')
  const [user, setUser] = useState<any>()
  const [payments, setPayments] = useState<any[]>([])
  const [formData, setFormData] = useState<FormDataType>({
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
    vehicleOwner : trip.supplierName || '',
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
    lrdate : new Date(trip?.dates[2] || Date.now()).toISOString().split('T')[0],
    spareParts: '',
    truckNo: trip.truck || '',
    challanNo: '',
    logo: ''
  })
  const billRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const fetchUser = async () => {
    try {
      const [res, paymentsRes] = await Promise.all([fetch('/api/users'), fetch(`/api/suppliers/${trip.supplier}/payments/trips/${trip.trip_id}`)])
      if (!res.ok || !paymentsRes.ok) {
        toast({
          description: 'Failed to fetch Details',
          variant: 'destructive'
        })
        return
      }
      const data = await res.json()
      const paymentsData = await paymentsRes.json()
      setPayments(paymentsData.supplierAccounts)
      const user = data.user
      setUser(user)
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
        advance: paymentsData.totalAmount
      }))
    } catch (error) {
      alert('Failed to fetch User Details')
    }
  }

  useEffect(() => {
    if (isOpen) fetchUser();
  }, [isOpen])

  const biltyColor = useMemo(() => {
    const copy = selectedCopy
    switch (copy) {
      case 'Consigner':
        return 'bg-red-100'
      case 'Consignee':
        return 'bg-blue-100'
      case 'Driver':
        return 'bg-yellow-100'
      case 'Office':
        return 'bg-green-100'


      default:
        break;
    }
  }, [selectedCopy])




  const downloadAllPDFs = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay to ensure color is applied
    generatePDF(billRef, { filename: `FM-${trip.LR}-${formData.truckNo}` });

    if (!user.companyName || !user.address || !user.gstNumber || !user.pincode || !user.email || !user.city || !user.panNumber || !user.company) {
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

  function CompanyHeader({ formData }: { formData: { logo: string; companyName: string } }) {
    const [dominantColor, setDominantColor] = useState("black");

    useEffect(() => {
      async function fetchDominantColor() {
        try {
          const color = await getBestLogoColor(formData.logo);
          setDominantColor(color);
        } catch (error) {
          console.error("Failed to fetch dominant color:", error);
          setDominantColor("black"); // Fallback color
        }
      }

      if (formData.logo) {
        fetchDominantColor();
      }
    }, [formData.logo]);

    return (
      <h1
        className={`text-3xl font-bold`}
        style={{ color: dominantColor }}
      >
        {formData.companyName}
      </h1>
    );
  }

  function Bilty({ formData, color }: { formData: FormDataType, color: string }) {
    const netBalance = Number(formData.truckHireCost) - Number(formData.advance) - Number(formData.commision) - Number(formData.hamali) - Number(formData.cashAC) - Number(formData.extra) - Number(formData.TDS) - Number(formData.tire) - Number(formData.spareParts)
    return (
      <Card className="relative max-w-[800px] mx-auto font-sans text-sm shadow-md bg-white p-0">

        <div className='border border-black border-b-0 p-2'>
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-lg font-semibold uppercase text-center border-b-2 border-gray-500 pb-1">Challan / Freight Memo</h1>
            <div className="text-right text-xs">
              <p>📞 {formData.contactNumber}</p>
            </div>
          </div>

          <div className="text-center mb-5">
            <div className="flex items-center justify-center">
              <Image src={formData.logo} alt="Company Logo" width={80} height={80} />
              <div className="ml-4">
                <h2 className="text-3xl font-semibold text-gray-800"><CompanyHeader formData={formData} /></h2>
                <p className="text-lg font-normal uppercase text-gray-700">Fleet Owners and Transport Contractors</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formData.address}, {formData.city}, {formData.pincode}
            </p>
            <p className='text-sm text-gray-600 mt-2'>
            {formData.email && ` ✉️ ${formData.email}`}
            </p>
          </div>
        </div>


        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-black p-2">Trailer No.: <strong>{formData.truckNo}</strong></td>
              <td className="border border-black p-2">Challan No.: <strong>{formData.challanNo}</strong></td>
              <td className="border border-black p-2">Date: <strong>{new Date(formData.date).toLocaleDateString('en-IN')}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Material: <strong>{formData.material}</strong></td>
              <td className="border border-black p-2">From: <strong>{formData.from}</strong></td>
              <td className="border border-black p-2">To: <strong>{formData.to}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Vehicle Owner: <strong>{formData.vehicleOwner}</strong></td>
              <td className="border border-black p-2" colSpan={2}>PAN No.: <strong>{formData.pan}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                <strong>Dasti to Driver:</strong>
              </td>
              <td className="border border-black p-2">Rate</td>
              <td className="border border-black p-2"><strong>{formData.billingtype}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2 align-top" rowSpan={14}>
                <div className="whitespace-pre-wrap text-sm italic flex flex-col gap-4">{payments?.map((payment : any, index : number)=>(
                  <div key={payment._id} className='flex items-center justify-start gap-4 font-semibold text-gray-900'>
                    <p>{index + 1}. </p>
                    <p> {new Date(payment.date).toLocaleDateString('en-IN')} -</p>
                    <p> ₹{formatNumber(payment.amount)}/-</p>
                  </div>
                ))}</div>
              </td>
              <td className="border border-black p-2">Truck Hire Cost</td>
              <td className="border border-black p-2"><strong>{formatNumber(formData.truckHireCost)}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Weight</td>
              <td className="border border-black p-2"><strong>{formData.weight}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Total Freight</td>
              <td className="border border-black p-2"><strong>{formatNumber(formData.truckHireCost)}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Advance</td>
              <td className="border border-black p-2"><strong>{formatNumber(formData.advance)}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Balance</td>
              <td className="border border-black p-2"><strong>{formatNumber(Number(formData.truckHireCost) - Number(formData.advance))}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Commission</td>
              <td className="border border-black p-2"><strong>{formatNumber(formData.commision)}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Hamali</td>
              <td className="border border-black p-2"><strong>{formatNumber(formData.hamali)}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Extra Weight</td>
              <td className="border border-black p-2"><strong>{formData.extraWeight}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Cash DASTI A/C</td>
              <td className="border border-black p-2"><strong>{formatNumber(formData.cashAC)}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Extra</td>
              <td className="border border-black p-2"><strong>{formData.extra}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">TDS</td>
              <td className="border border-black p-2"><strong>{formData.TDS}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Tyre</td>
              <td className="border border-black p-2"><strong>{formData.tire}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2">Spare Parts</td>
              <td className="border border-black p-2"><strong>{formData.spareParts}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold">Net Balance</td>
              <td className="border border-black p-2 font-bold"><strong>{formatNumber(netBalance)}</strong></td>
            </tr>
            <tr>
              <td className="border border-black p-2" colSpan={3}>
                <strong>LR Rec. Date: {new Date(formData.lrdate).toLocaleDateString('en-IN')}</strong>
                <p><strong>Payment Date:</strong></p>
              </td>
            </tr>
          </tbody>
        </table>

        <div className='border border-black border-t-0 p-2'>
          <div className="mt-4 text-sm">
            <strong>Conditions:</strong>
            <div className="flex justify-between items-center gap-8">
              <p>Vehicle owner is responsible for the safe and timely delivery of the consignment and would be fined in case of late delivery and damages.</p>
              <span className='whitespace-nowrap'>For {formData.companyName}</span>
            </div>
            <div className="text-right mt-12">
              <p>Cashier/Accountant</p>
            </div>
          </div>

          <div className="text-center text-xs mt-4 py-4">
            <p className="flex items-center justify-center">
              Powered by
              <Image src="https://www.awajahi.com/awajahi%20logo.png" alt="Awajahi logo" width={20} height={20} className="mx-1" />
              Awajahi
            </p>
          </div>
        </div>

      </Card>
    );

  }

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
                            value={formData[field as keyof FormDataType] as string || ""}
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
            <div ref={billRef} className="p-2">
              <Bilty formData={formData} color={biltyColor as string} />
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setShowBill(false)}>
                Edit Form
              </Button>
              <Button onClick={() => downloadAllPDFs()}>Download PDF</Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>

  )
}
