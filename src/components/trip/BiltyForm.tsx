'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from 'framer-motion'

type props = {
  isOpen : boolean
  onClose : any

}

type formdataType = {
  gstNumber: string,
    pan: string,
    companyName: string,
    address: string,
    ciy: string,
    pincode: string,
    contactNumber: string,
    email: string,
    date : Date,
    LR : string,
    consigner : {
      gstNumber : string,
      name : string,
      address : string,
      city : string,
      pincode : string,
      contactNumber : string
    },
    consignee : {
      gstNumber : string,
      name : string,
      address : string,
      city : string,
      pincode : string,
      contactNumber : string
    }
}

const BiltyForm: React.FC<props> = ({isOpen, onClose}) => {


  const [steps, setSteps] = useState<1 | 2 | 3 | 4>(1)
  const [formdata, setFormData] = useState<formdataType>({
    gstNumber: '',
    pan: '',
    companyName: '',
    address: '',
    ciy: '',
    pincode: '',
    contactNumber: '',
    email: '',
    date : new Date(Date.now()),
    LR : '',
    consigner : {
      gstNumber : '',
      name : '',
      address : '',
      city : '',
      pincode : '',
      contactNumber : ''
    },
    consignee : {
      gstNumber : '',
      name : '',
      address : '',
      city : '',
      pincode : '',
      contactNumber : ''
    }
  })
  if(!isOpen) return null
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
    >
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01]
          }}
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[700px] overflow-y-auto thin-scrollbar"
        >
          <div className='flex justify-between'>
          <h1 className='font-semibold text-xl text-black my-2'>Bilty Details</h1>
          <Button variant={'ghost'} onClick={onClose}><AiOutlineClose /></Button>
          </div>
          
          <form>
            {steps === 1 &&
              <div className='flex flex-col gap-2 items-center transition-all duration-300 ease-in-out'>
                <input type='text' placeholder='GST' value={formdata.gstNumber} name='gstNumber' />
                <input type='text' placeholder='PAN Number' value={formdata.pan} name='pan' />
                <input type='text' placeholder='Company Name' value={formdata.companyName} name='companyName' />
                <input type='text' placeholder='Address' value={formdata.address} name='address' />
                <input type='text' placeholder='City' value={formdata.ciy} name='ciy' />
                <input type='text' placeholder='Pincode' value={formdata.pincode} name='pincode' />
                <input type='text' placeholder='Contact Number' value={formdata.contactNumber} name='contactNumber' />
                <input type='text' placeholder='Email' value={formdata.email} name='email' />
                <Button className='w-full' onClick={() => setSteps(2)}>Next</Button>
              </div>}

              {steps === 2 && 
              <div className='flex flex-col gap-2 items-center transition-transform duration-300 ease-in-out'>
                <input type='date' value={new Date(formdata.date).toISOString().split('T')[0]} name='date' /> 
                <input type='text' placeholder='LR' value={formdata.LR} name='LR' />
                <div className='grid grid-cols-2 gap-2 w-full'>
                  <div className='flex flex-col items-center gap-2'>
                    <h2 className=' text-black font-semibold text-lg'>Consigner Details</h2>
                    <input type='text' placeholder='GST' value={formdata.consigner.gstNumber} name='consignerGST' />
                    <input type='text' placeholder='Name' value={formdata.consigner.name} name='consignerName' />
                    <input type='text' placeholder='Address' value={formdata.consigner.address} name='consignerAddress' />
                    <input type='text' placeholder='City' value={formdata.consigner.city} name='consignerCity' />
                    <input type='text' placeholder='Pincode' value={formdata.consigner.pincode} name='consignerPincode' />
                    <input type='text' placeholder='Contact Number' value={formdata.consigner.contactNumber} name='consignerContactNumber' />
                  </div>
                  <div className='flex flex-col items-center gap-2'>
                  <h2 className=' text-black font-semibold text-lg'>Consignee Details</h2>
                    <input type='text' placeholder='GST' value={formdata.consignee.gstNumber} name='consignerGST' />
                    <input type='text' placeholder='Name' value={formdata.consignee.name} name='consigneeName' />
                    <input type='text' placeholder='Address' value={formdata.consignee.address} name='consigneeAddress' />
                    <input type='text' placeholder='City' value={formdata.consignee.city} name='consigneeCity' />
                    <input type='text' placeholder='Pincode' value={formdata.consignee.pincode} name='consigneePincode' />
                    <input type='text' placeholder='Contact Number' value={formdata.consignee.contactNumber} name='consigneeContactNumber' />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <Button variant={'outline'} onClick={()=>setSteps(1)}>Back</Button>
                  <Button onClick={()=>setSteps(3)}>Next</Button>
                </div>
              </div>
              }

          </form>
          <footer className='text-red-500 text-xs'>*currently under development</footer>
        </motion.div>
      </div>
      
    </div>
  )
}

export default BiltyForm