'use client'

import { Button } from '@/components/ui/button'
import { ITrip } from '@/utils/interface'
import React, { useState } from 'react'
import { useTrip } from '@/context/tripContext'
import Link from 'next/link'

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
  const {trip} = useTrip()
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
       <Link href={`/user/trips/invoice?party=${encodeURIComponent(trip.party)}&route=${encodeURIComponent(JSON.stringify(trip.route))}&trips=${encodeURIComponent(JSON.stringify([trip.trip_id]))}`}>
      <Button variant="outline" >
        <span className="truncate">Generate Bill/Invoice</span>
      </Button>
      </Link>
      
    </div>
  )
}

export default ViewBillButton

