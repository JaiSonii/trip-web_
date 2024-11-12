'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ITrip } from '@/utils/interface'
import generatePDF from 'react-to-pdf';

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
  pan: 'Enter PAN',
  companyName: 'Enter Company Name',
  address: 'Enter Address',
  city: 'Enter City',
  pincode: 'Enter Pincode',
  contactNumber: 'Enter Contact Number',
  email: 'Enter Email Address',
  date: 'Select Date',
  LR: 'Enter LR Number',
  consigner: 'Enter Consigner Details',
  consignee: 'Enter Consignee Details',
  material: 'Enter Material Name',
  weight: 'Enter Weight',
  unit: 'Enter Unit',
  paidBy: 'Enter Payment Responsible Party',
  ewayBillNo: 'Enter E-Way Bill Number',
  invoiceNo: 'Enter Invoice Number',
  name: 'Enter Name'
};

type FormDataType = {
  gstNumber: string
  pan: string
  companyName: string
  address: string
  city: string
  pincode: string
  contactNumber: string
  email: string
  date: Date
  LR: string
  consigner: ConsignerConsigneeType
  consignee: ConsignerConsigneeType
  material: string
  weight: string
  unit: string
  paidBy: 'consigner' | 'consignee' | 'agent'
  ewayBillNo: string
  invoiceNo: string
  truckNo : string
}

const steps = [
  {
    title: 'Company Details',
    fields: ['gstNumber', 'pan', 'companyName', 'address', 'city', 'pincode', 'contactNumber', 'email']
  },
  {
    title: 'Consigner/Consignee Details',
    fields: ['date', 'LR', 'consigner', 'consignee']
  },
  {
    title: 'Trip Details',
    fields: ['material', 'weight', 'unit', 'paidBy']
  },
  {
    title: 'E-Way Bill Details',
    fields: ['ewayBillNo', 'invoiceNo']
  }
]

const tabs = ['Consigner', 'Consignee', 'Office', 'Driver']

export default function BiltyForm({ isOpen, onClose, trip }: Props) {

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
    LR: trip.LR || '',
    consigner: {
      gstNumber: '',
      name: '',
      address: trip.route.origin,
      city: trip.route.origin,
      pincode: '',
      contactNumber: ''
    },
    consignee: {
      gstNumber: '',
      name: '',
      address: trip.route.destination,
      city: trip.route.destination,
      pincode: '',
      contactNumber: ''
    },
    material: trip.material || '',
    weight: '',
    unit: '',
    paidBy: 'consigner',
    ewayBillNo: '',
    invoiceNo: '',
    truckNo : trip.truck || ''
  })
  const billRef = useRef<HTMLDivElement>(null)

  const fetchUser = async()=>{
    try{
      const res = await fetch('/api/users')
      if(!res.ok){
        alert('Failed to fetch details')
        return
      }
      const data = await res.json()
      const user = data.user
      setUser(user)
      setFormData((prev)=>({
        ...prev,
        companyName : user.company,
        address : user.address,
        contactNumber : user.phone,
        gstNumber : user.gstNumber
      }))
    }catch(error){
      alert('Failed to fetch User Details')
    }
  }

  useEffect(()=>{
    if(isOpen) fetchUser();
  },[isOpen])

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
    for (const tab of tabs) {
      setSelectedCopy(tab); // Set the color for each PDF
      await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay to ensure color is applied
      generatePDF(billRef, { filename: `Bilty-${tab}-${selectedCopy + " Copy"}-${trip.LR}-${formData.truckNo}-${trip.trip_id}` });
    }
    if(!user.companyName || !user.address || !user.gstNumber){
      try {
        const res = await fetch('/api/users',{
          method : 'PUT',
          body : JSON.stringify({
            companyName: user.company || formData.companyName,
            address: user.address || formData.address,
            gstNumber: user.gstNumber || formData.gstNumber
          })
        })
        if(!res.ok){
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

  function Bilty({ formData, color }: { formData: FormDataType, color: string }) {
    return (


      <div className={`border border-black  w-full h-full ${color} relative max-w-[1000px]`}>

        <section className="px-6 py-2 w-full">
          <div className="flex items-center gap-8 justify-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-black text-white text-center flex items-center justify-center"
                style={{ width: "70px", height: "70px" }}>Logo</div>
            </div>

            <div className="text-center py-2 border-b border-black">
              <h1 className="text-3xl font-bold text-black">{formData.companyName}</h1>
              <h2 className="text-lg font-normal text-gray-700">FLEET OWNERS & TRANSPORT CONTRACTOR</h2>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {formData.address}
              </span>
            </div>

            <div className="text-right text-gray-700 absolute top-2 right-2">
              <div className="flex items-center gap-1">
                <div>
                  <img src="https://img.icons8.com/ios-filled/50/000000/phone.png" alt="Phone Icon"
                    height="20px" width="20px" />
                </div>
                <div>
                  <p className="text-xs">{formData.contactNumber}</p>
                  <p className="text-xs">{formData.contactNumber}</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <section className="">
              <div className="grid grid-cols-3 gap-10 ">
                <div className=" col-span-1 border-y-2 border-r-2 border-black p-1">
                  <p className="text-xs font-semibold text-black text-center mb-2 whitespace-nowrap">SCHEDULE OF
                    DEMURRAGE</p>
                  <p className="text-xs text-black whitespace-nowrap">Demurrage chargebl after……………</p>
                  <p className="text-xs text-black whitespace-nowrap">days from today@RS…….………</p>
                  <p className="text-xs text-black whitespace-nowrap">perday per Qtl. On weight charged</p>
                </div >
                <div className="flex flex-col">
                  <span
                    className="text-sm font-semibold text-center p-2 border-b border-black text-[#FF0000] whitespace-nowrap ">{selectedCopy.toUpperCase() + " COPY"}</span>
                  <span
                    className="text-sm font-normal text-center p-2 border-b border-black text-black whitespace-nowrap">AT
                    CARRIERS RISK</span>
                  <span
                    className="text-[#FF0000] text-sm font-semibold text-center p-2 whitespace-nowrap">INSURANCE</span>
                </div>
                <div className="flex-col w-full col-span-1">
                  <div className="border-2 p-1 border-black">
                    <p className="text-sm text-black text-center font-semibold">Caution</p>
                    <p className="text-xs text-black" style={{ fontSize: "10px" }}>This Consignment will not be
                      detaineddiverted. rerouted or rebooked
                      withoutConsignee Bank&apos;s written permission.Will be delivered at the destination</p>
                  </div>

                  <div className="py-1 text-black border-b border-black">
                    <span className="text-xs font-semibold">Address of Delivery Office :</span>
                  </div>
                  <div className="flex gap-24 text-xs font-semibold">
                    <p>State :</p>
                    <p>Tel : {formData.consignee.contactNumber}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className=" mt-4">
              <div className="grid grid-cols-9 gap-10">
                <div className="border-2 border-[#FF0000] text-[#FF0000] p-1 border-l-0 col-span-3">
                  <h3 className="text-xs text-[#FF0000] text-center">NOTICE</h3>
                  <p className=" text-[10px]">The consignment covered by this Lorry ceipt shall be stored
                    at the destination Under the control of the Transport Operator
                    and shall be delivered to or to the order of the Consignee
                    Bank whose name is mentioned in the Lorry Receipt. It will
                    under no circumstances be delivered to anyone without the
                    written authority from the Consignee banker or its order.
                    endorsed on the Consignee copy</p>
                </div>
                <div className="col-span-3 border border-black p-2 text-xs text-black">
                  <p>The Customer has stated that:</p>
                  <p>He has insured the consignment Company ………………</p>
                  <p>Policy No. ……… Date ……</p>
                  <p>Amount …………… Date ………</p>
                </div>
                <div className="col-span-3 text-xs text-black p-1 border-2 border-black flex flex-col gap-1">
                  <span className="text-xs">CONSIGNMENT NOTE</span>
                  <span>No. : <span className='text-red-500'>{formData.LR}</span></span>
                  <span>Date : <span className='text-red-500'>{new Date(formData.date).toLocaleDateString('en-IN')}</span></span>
                </div>




              </div>
            </section>

            <section className=" mt-4">
              <div className="grid grid-cols-9 gap-10 ">
                <div className="col-span-6 font-semibold text-black border-t-2 border-black border-l-0" style={{ fontSize: "small" }}>
                  <div className='border-b-2 border-r-2 border-black p-1'>
                    <p>Consigner Name and Address :</p>
                    <p className=" text-red-500">{formData.consigner.name + " " + formData.consigner.address}</p>
                  </div>
                  <div className='border-b-2 border-r-2 border-black p-1'>
                    <p>Consignee Name and Address :</p>
                    <p className=" text-red-500">{formData.consignee.name + " " + formData.consignee.address}</p>
                  </div>

                </div>

                <div className="col-span-3 p-2 text-xs text-black">
                  <div className="mb-2">
                    <label className="text-[10px]">From :</label>
                    <p className="border border-black rounded-lg p-2 mt-2 text-red-500">{trip?.route.origin}</p>
                    <label className="text-[10px]">To :</label>
                    <p className="border border-black rounded-lg p-2 mt-2 text-red-500">{trip?.route.destination}</p>

                  </div>
                </div>
              </div>
            </section>

            <section className=" mt-4">
              <table className="table-auto w-full text-xs">
                <thead className="font-semibold text-center">
                  <tr>
                    <th className="border p-2 border-black">Packages</th>
                    <th className="border p-2 border-black">Description (said to contain)</th>
                    <th className="border p-2 border-black">Actual</th>
                    <th className="border p-2 border-black">Charged</th>
                    <th className="border p-2 border-black">Rate</th>
                    <th className="border p-2 border-black">Amount to pay/paid</th>
                  </tr>
                </thead>
                <tbody className="text-center text-red-500">
                  {formData.material?.split(',').map((item: string, index: number) => (
                    <tr key={index}>
                      <td className="border p-2 border-black">{index + 1}</td>
                      <td className="border p-2 border-black">{item}</td>
                      <td className="border p-2 border-black">Fixed</td>
                      <td className="border p-2 border-black">Fixed</td>
                      <td className="border p-2 border-black">Fixed</td>
                      <td className="border p-2 border-black">Fixed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

          </div>
          <div className="col-span-1 border border-black border-r-0">
            <div className="text-[11px] border-b-2 border-black">
              <div className="border-b-2 p-1 border-black flex flex-col">
                <span>Address of Issuing Office : </span>
                <span>Name and Address of Agent : <span className='text-red-500'>{formData.companyName}</span></span>
              </div>
              <div className="flex items-center justify-center text-center p-16 text-lg text-red-500">{formData.city}</div>
            </div>
            <div className="border-b-2 border-black">
              <div className="border-b-2 border-black p-1">
                <p className="text-xs text-black">SERVICE TAX TO BE PAID BY</p>
              </div>
              <div className="grid grid-cols-3 text-[10px] h-[25px]">
                <div className="flex items-center justify-center border-r-2 border-black p-1 overflow-hidden">
                  CONSIGNER
                </div>
                <div className="flex items-center justify-center border-r-2 border-black p-1 overflow-hidden">
                  CONSIGNEE
                </div>
                <div className="flex items-center justify-center p-1 overflow-hidden">
                  SIGNATORY
                </div>
              </div>
            </div>

            <div className="border-b-2 border-black text-xs flex flex-col gap-4 max-h-[100px] h-full">
              <h3 className="text-black text-center">Service Tax Reg No.</h3>
              <span className="mt-4 text-black">PAN No.</span>
            </div>
            <div className=" text-black text-[10px] flex flex-col gap-3 p-1">
              <span className="underline text-black">Private Mark</span>
              <span>
                ST No :
              </span>
              <span>
                CST No :
              </span>
              <span>
                DO No. :
              </span>
              <span>
                INV No. :
              </span>
              <span>
                Date :
              </span>
              <span>
                Lorry No. : <span className='text-red-500'>{formData.truckNo}</span>
              </span>
            </div>

          </div>
          <div className="text-xs p-4 flex gap-6 justify-between w-full">
            <span className="text-black whitespace-nowrap">
              Value : <span className="text-red-500">As Per Invoice</span>
            </span>
            <span className="text-black text-xs whitespace-nowrap">
              Signature of Transport Operator :
            </span>

          </div>
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
        <div className='flex justify-between items-center mb-4'>
          <h1 className='font-semibold text-xl text-black'>Bilty Details</h1>
          <Button variant='ghost' size='icon' onClick={onClose}><X /></Button>
        </div>

        {!showBill ?
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <motion.div
              className="bg-lightOrange h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div> :
          <div className="flex items-start gap-16 mb-4">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`cursor-pointer px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-md text-black hover:bg-[#3190F540] ${selectedCopy === tab
                  ? 'border-b-2 border-[#3190F5] rounded-b-none'
                  : 'border-transparent'
                  }`}
                onClick={() => setSelectedCopy(tab)}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab + " Copy"}</span>
                </div>
              </div>
            ))}
          </div>}
        {!showBill ?
          <form onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <h2 className='text-lg font-semibold text-black mt-2 mb-4'>{steps[currentStep].title}</h2>

                {currentStep === 0 && (
                  <>
                    {(steps[currentStep].fields as (keyof FormDataType)[]).map((field) => (
                      <div key={field} className="mb-1">
                        <label htmlFor={field} className='text-xs text-gray-500'>{placeholders[field]}</label>
                        <Input
                          id={field}
                          name={field}
                          value={formData[field] as string}
                          onChange={handleInputChange}
                          className="mt-[1px]"
                        />
                      </div>
                    ))}
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <div className="mb-4">
                      <Label htmlFor="date">Date</Label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={new Date(formData.date).toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      {/* <Label htmlFor="LR">LR</Label> */}
                      <Input
                        id="LR"
                        name="LR"
                        value={formData.LR}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder='LR'
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Consigner Details</h3>
                        {Object.keys(formData.consigner).map((field) => (
                          <div key={field} className="mb-1">
                            <label htmlFor={`consigner.${field}`} className='text-xs text-gray-500'>{placeholders[field]}</label>
                            <Input
                              id={`consigner.${field}`}
                              name={`consigner.${field}`}
                              value={formData.consigner[field as keyof ConsignerConsigneeType]}
                              onChange={handleInputChange}
                              className="mt-[1px]"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Consignee Details</h3>
                        {Object.keys(formData.consignee).map((field) => (
                          <div key={field} className="mb-1">
                            <label htmlFor={`consignee.${field}`} className='text-xs text-gray-500'>{placeholders[field]}</label>
                            <Input
                              id={`consignee.${field}`}
                              name={`consignee.${field}`}
                              value={formData.consignee[field as keyof ConsignerConsigneeType]}
                              onChange={handleInputChange}
                              className="mt-[1px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="mb-4">
                      {/* <Label htmlFor="material">Material</Label> */}
                      <Input
                        id="material"
                        name="material"
                        value={formData.material}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder='Material (use comma for multiple materials)'
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        {/* <Label htmlFor="weight">Weight</Label> */}
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          value={formData.weight}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder='Weight'
                        />
                      </div>
                      <div>
                        {/* <Label htmlFor="unit">Unit</Label> */}
                        <Input
                          id="unit"
                          name="unit"
                          type="number"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder='Unit'
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label>Freight Amount paid by</Label>
                      <RadioGroup
                        value={formData.paidBy}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, paidBy: value as 'consigner' | 'consignee' | 'agent' }))}
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="consigner" id="consigner" />
                          <Label htmlFor="consigner">Consigner</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="consignee" id="consignee" />
                          <Label htmlFor="consignee">Consignee</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="agent" id="agent" />
                          <Label htmlFor="agent">Agent</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="mb-4">
                      {/* <Label htmlFor="ewayBillNo">E-Way Bill No.</Label> */}
                      <Input
                        id="ewayBillNo"
                        name="ewayBillNo"
                        value={formData.ewayBillNo}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder={placeholders['ewayBillNo']}
                      />
                    </div>
                    <div className="mb-4">
                      {/* <Label htmlFor="invoiceNo">Goods Invoice No.</Label> */}
                      <Input
                        id="invoiceNo"
                        name="invoiceNo"
                        value={formData.invoiceNo}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder={placeholders['invoiceNo']}
                      />
                    </div>
                    <div className="mb-4">
                      <Input value="As per Invoice" disabled className="mt-1" />
                    </div>
                  </>
                )}

                <div className='flex justify-between mt-6'>
                  {currentStep > 0 && (
                    <Button variant='outline' onClick={handleBack}>Back</Button>
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
          :
          <div className='w-full'>
            <div ref={billRef} className='p-4'>
              <Bilty formData={formData} color={biltyColor as string} />
            </div>

            <div className="mt-4 flex justify-between">
              <Button variant='outline' onClick={() => setShowBill(false)}>Edit Form</Button>
              <Button onClick={() => downloadAllPDFs()}>Download PDF</Button>
            </div>
          </div>
        }

        {/* <footer className='text-red-500 text-xs mt-4'>*currently under development</footer> */}
      </motion.div>



    </motion.div>
  )
}