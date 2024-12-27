'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ITrip } from '@/utils/interface'
import React, { useState } from 'react'
import InvoiceForm from './InoiveForm'

type Props = {
  trips: ITrip[] | any[]
}

type FormDataType = {
  logourl: string
  billNo: string
  date: string
  from: string
  to: string
  address: string
  branch: string
  material: string
  partyName: string
  frieghtCharges: {
    lr: string
    truckNo: string
    material: string
    weight: string
    charged: string
    rate: string
    amount: number
  }[]
  additonalCharges: {
    truckNo: string
    material: string
    remarks: string
    amount: number
  }[]
  partyDetails: {
    msmeNo: string
    gstNumber: string
    pan: string
    accNo: string
    ifscCode: string
    bankBranch: string
    bankName: string
  }[]
  paymentDetails: {
    date: string
    paymentMode: string
    notes: string
    amount: number
  }[]
}

const ViewBillButton: React.FC<Props> = () => {
  const [show, setShow] = useState(false)
  const [formData, setFormData] = useState<FormDataType>({
    logourl: '',
    billNo: '',
    date: '',
    from: '',
    to: '',
    address: '',
    branch: '',
    material: '',
    partyName: '',
    frieghtCharges: [],
    additonalCharges: [],
    partyDetails: [],
    paymentDetails: [],
  })


  return (
    <div>
      <Button variant="outline" onClick={() => setShow(!show)}>
        <span className="truncate">{show ? 'Hide Bill' : 'View Bill'}</span>
      </Button>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          {/* <InvoiceForm setShow={setShow}/> */}
        </div>
      )}
    </div>
  )
}

export default ViewBillButton

