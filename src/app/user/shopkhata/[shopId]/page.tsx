'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'

const ShopPage = () => {

  const {shopId} = useParams()
  const [accounts, setAccounts] = useState<any[]>([])

  const fetchAccounts = async()=>{
    const res = await fetch(`/api/shopkhata/${shopId}/accounts`)
    const data = res.ok ? await res.json() : alert('Failed to fetch shopkhata')
    setAccounts(data.khata)
    console.log(data)
  }

  useEffect(()=>{
    if(shopId){
      fetchAccounts() 
    }
  },[shopId])

  return (
    <div className="w-full">
      
      <div className="w-full h-full p-4">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Credit</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index: number) => (
                <tr key={account._id}>
                  <td>
                    <div className='flex items-center space-x-2'>
                      <FaCalendarAlt className='text-bottomNavBarColor' />
                      <span>{new Date(account.date || account.paymentDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td >
                    <div className='flex items-center space-x-2 '>
                      <span>{account.reason || account.expenseType || `Trip ${account.accountType} `}</span>
                      {account.trip_id && <Button variant={"link"} className='text-red-500 pt-1 rounded-lg'><Link href={`/user/trips/${account.trip_id}`}>from a trip</Link></Button>}
                    </div>
                  </td>
                  <td><span className='text-red-600 font-semibold'>{account.credit || (account.type === 'truck' && account.amount) || ''}</span></td>
                  <td ><span className='text-green-600 font-semibold'>{account.payment || (account.type !== 'truck' && account.amount) || ''}</span></td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ShopPage