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
import { getDominantColor } from '@/utils/imgColor'
import { formatNumber } from '@/utils/utilArray'
import logo from '@/assets/awajahi logo.png'

type ConsignerConsigneeType = {
  gstNumber: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
};

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
  commission: 'Enter Commission Amount',
  hamali: 'Enter Hamali Charges',
  extraWeight: 'Enter Extra Weight (if any)',
  cashAC: 'Enter Dasti Account Charges',
  extra: 'Enter Extra Charges',
  TDS: 'Enter TDS Amount',
  tyre: 'Enter Tire Charges (if applicable)',
  spareParts: 'Enter Spare Parts Cost (if applicable)',
  truckNo: 'Enter Truck Number',
  logo: 'Upload Company Logo',
  challanNo: 'Enter Challan Number'
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
  weight: string;
  material: string;
  unit: string;
  noOfBags: string;
  amount: string;
  advance: string;
  balance: string;
  commission: string;
  hamali: string;
  extraWeight: string;
  cashAC: string;
  extra: string;
  TDS: string;
  tire: string;
  spareParts: string;
  truckNo: string;
  logo: string;
}


const steps = [
  {
    title: 'Company Details',
    fields: ['gstNumber', 'pan', 'companyName', 'address', 'city', 'pincode', 'contactNumber', 'email']
  },
  {
    title: 'Frieght Memo Details',
    fields: ['date', 'challanNo']
  },
  {
    title: 'Trip Details',
    fields: ['from', 'to', 'truckNo', 'truckHireCost', 'material', 'weight', 'unit', 'noOfBags', 'amount', 'advance', 'balance', 'commission', 'hamali']
  },
  {
    title: 'Extra Details',
    fields: ['extraWeight', 'cashAC', 'extra', 'TDS', 'tyre', 'spareParts']
  }
]

const tabs = ['Consigner', 'Consignee', 'Office', 'Driver']

export default function FrieghtMemo({ isOpen, onClose, trip }: Props) {

  const [currentStep, setCurrentStep] = useState(0)
  const [showBill, setShowBill] = useState(false)
  const [selectedCopy, setSelectedCopy] = useState('Consigner')
  const [user, setUser] = useState<any>()
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
    unit: '',
    noOfBags: '',
    amount: trip.amount || '',
    advance: trip.tripAccounts.reduce(
      (total: number, account: PaymentBook) => account.accountType === 'Advances' ? total + account.amount : total,
      0 // Initial value for the accumulator
    ) || '',
    balance: trip.balance || '',
    commission: '',
    hamali: '',
    extraWeight: '',
    cashAC: '',
    extra: '',
    TDS: '',
    tire: '',
    spareParts: '',
    truckNo: trip.truck || '',
    challanNo: '',
    logo: ''
  })
  const billRef = useRef<HTMLDivElement>(null)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) {
        alert('Failed to fetch details')
        return
      }
      const data = await res.json()
      const user = data.user
      setUser(user)
      setFormData((prev) => ({
        ...prev,
        companyName: user.company,
        address: user.address,
        contactNumber: user.phone,
        gstNumber: user.gstNumber,
        logo: user.logoUrl
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
      generatePDF(billRef, { filename: `FM-${trip.LR}-${formData.truckNo}-${trip.trip_id}` });
    
    if (!user.companyName || !user.address || !user.gstNumber) {
      try {
        const res = await fetch('/api/users', {
          method: 'PUT',
          body: JSON.stringify({
            companyName: user.company || formData.companyName,
            address: user.address || formData.address,
            gstNumber: user.gstNumber || formData.gstNumber
          })
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
          const color = await getDominantColor(formData.logo);
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
    return (
      <div className=" max-w-2xl container border border-black p-6 font-roboto text-sm">
        <div className="text-center">
          <h1 className="text-orange-500 text-base font-bold">CHALLAN/FREIGHT MEMO</h1>
          <h2 className="text-2xl font-bold text-black">{formData.companyName}</h2>
        </div>

        <div className="text-center mt-2">
          <p className="text-sm">
            {formData.address},<br /> {formData.city}, {formData.pincode}
          </p>
        </div>

        <div className="text-right text-xs mt-2">
          <p>📞 {formData.contactNumber}{formData.email && `, ✉️ ${formData.email}`}</p>
        </div>

        <table className="w-full border-collapse mt-6">
          <tbody>
            <tr>
              <td className="border border-black p-2">Trailer No.: {formData.truckNo}</td>
              <td className="border border-black p-2">Challan No.: {formData.challanNo}</td>
              <td className="border border-black p-2">Date: {new Date(formData.date).toLocaleDateString('en-IN')}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Material: {formData.material}</td>
              <td className="border border-black p-2">From: {formData.from}</td>
              <td className="border border-black p-2">To: {formData.to}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Vehicle Owner: </td>
              <td className="border border-black p-2" colSpan={2}>PAN No.: {formData.pan}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 align-top" rowSpan={14} style={{ width: '50%' }}>
                <strong>DASTI TO DRIVER:</strong>
                <div className="whitespace-pre-line mt-2 text-sm">
                  {formData.cashAC}
                </div>
              </td>
              <td className="border border-black p-2">Rate</td>
              <td className="border border-black p-2">{trip.billingType}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Truck Hire Cost</td>
              <td className="border border-black p-2">{formatNumber(formData.truckHireCost)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Weight</td>
              <td className="border border-black p-2">{formData.weight}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Total Freight</td>
              <td className="border border-black p-2">{formatNumber(formData.amount)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Advance</td>
              <td className="border border-black p-2">{formatNumber(formData.advance)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Balance</td>
              <td className="border border-black p-2">{formatNumber(formData.advance)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Commission</td>
              <td className="border border-black p-2">{formatNumber(formData.commission)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Hamali</td>
              <td className="border border-black p-2">{formatNumber(formData.hamali)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Extra Weight</td>
              <td className="border border-black p-2">{formData.extraWeight}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Extra</td>
              <td className="border border-black p-2">{formData.extra}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">TDS</td>
              <td className="border border-black p-2">{formData.TDS}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Tyre</td>
              <td className="border border-black p-2">{formData.tire}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Spare Parts</td>
              <td className="border border-black p-2">{formData.spareParts}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold">Net Balance</td>
              <td className="border border-black p-2 font-bold">{formatNumber(formData.balance)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2" colSpan={3}>
                <strong>LR Rec. date: {new Date(formData.date).toLocaleDateString('en-IN')}</strong>
                <p className="mt-2"></p>
                <strong>Payment date:</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-xs mt-4">
          <p><strong>Conditions:</strong> Vehicle owner is responsible for the safe and timely delivery of the consignment and would be fined in case of late delivery and damages.</p>
        </div>

        <div className="text-center text-xs mt-4 flex items-center justify-center">
          <span className='flex space-x-2'>Powered with <Image src={logo} alt='awajahi logo' width={15} height={15} className='mx-1'/> Awajahi</span>
        </div>
      </div>
    )

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

                      // if (field === "consigner" || field === "consignee") {
                      //   const group = formData[field];
                      //   return (
                      //     <div key={field} className="mb-4 col-span-2">
                      //       <h3 className="font-semibold mb-2 capitalize">{field} Details</h3>
                      //       <div className="grid grid-cols-2 gap-4">
                      //         {Object.keys(group).map((subField) => (
                      //           <div className="mb-1" key={subField}>
                      //             <label htmlFor={`${field}.${subField}`} className="text-xs text-gray-500">
                      //               {placeholders[subField]}
                      //             </label>
                      //             <Input
                      //               id={`${field}.${subField}`}
                      //               name={`${field}.${subField}`}
                      //               value={group[subField]}
                      //               onChange={handleInputChange}
                      //               className="mt-1"
                      //             />
                      //           </div>
                      //         ))}
                      //       </div>
                      //     </div>
                      //   );
                      // }

                      return (
                        <div key={field} className="mb-1">
                          <label htmlFor={field} className="text-xs text-gray-500">
                            {placeholders[field]}
                          </label>
                          <Input
                            id={field}
                            name={field}
                            value={formData[field as keyof FormDataType] as string|| ""}
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