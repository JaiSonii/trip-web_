'use client'

import { useRouter } from 'next/navigation'
import React from 'react'


const SupplierPage = () => {
    const router = useRouter()
    router.push('trips')
  return (
    <div>Loading...</div>
  )
}

export default SupplierPage