'use client'
import { useRouter } from 'next/navigation'
import React from 'react'


const ExpensePage = () => {
    const router = useRouter()
    router.push(`/user/expenses/truckExpense`)
  return (
    <div>ExpensePage</div>
  )
}

export default ExpensePage