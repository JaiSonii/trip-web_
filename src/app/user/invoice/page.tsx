'use client'

import { useExpenseData } from '@/components/hooks/useExpenseData'
import React, { useEffect, useState } from 'react'
import Loading from '../loading'
import invImg from '@/assets/sampleInvoice.png'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { loadingIndicator } from '@/components/ui/LoadingIndicator'


const PreviewDocument = dynamic(()=>import('@/components/documents/PreviewDocument'),{ssr : false, loading : ()=><div className='flex items-center justify-center fixed'>{loadingIndicator}</div>})

const InvoicePage = () => {
    const { invoices, refetchInvoice, isLoading } = useExpenseData()
    const [documentUrl, setDocumentUrl] = useState('')
    const [preview, setPreview] = useState(false)
    useEffect(() => {
        refetchInvoice()
    }, [refetchInvoice])

    if (isLoading) {
        return <Loading />
    }


    return (
        <div className='px-8 container mx-auto'>
            <h1 className='text-black text-3xl font-semibold my-4'>Invoices</h1>
            <div className="py-2 px-1 rounded-lg shadow-sm border-2 border-gray-300">
                <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-xl">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Invoice</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Party</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Issued Date</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Due Date</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Advance</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {invoices && invoices?.length > 0 ?
                            invoices?.map(invoice => (
                                <tr key={invoice._id} className='hover:bg-gray-50 cursor-pointer' onClick={()=>{
                                    setDocumentUrl(invoice.url)
                                    setPreview(true)
                                }}>
                                    <td className='py-2 px-3 text-sm text-gray-500 border-b border-gray-200'>
                                        <div className='flex items-center gap-2'>
                                            <Image src={invImg} alt='Invoice' width={100} height={100} className='border border-gray-400 rounded-md' />
                                            <p>invoice #{invoice.invoiceNo}</p>
                                        </div>
                                    </td>
                                    <td className='py-2 px-3 text-sm text-gray-500 border-b border-gray-200'>{invoice.partyName || ''}</td>
                                    <td className='py-2 px-3 text-sm text-gray-500 border-b border-gray-200'>{new Date(invoice.date).toLocaleDateString('en-IN')}</td>
                                    <td className='py-2 px-3 text-sm text-gray-500 border-b border-gray-200'>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</td>
                                    <td className='py-2 px-3 text-sm text-gray-500 border-b border-gray-200'>{invoice.total}</td>
                                    <td className='py-2 px-3 text-sm text-gray-500 border-b border-gray-200'>{invoice.advance}</td>
                                    <td className='py-2 px-3 text-sm text-gray-500 border-b border-gray-200'></td>
                                </tr>
                            ))
                            : <p>No invoice found</p>
                        }


                    </tbody>
                </table>
            </div>
                <PreviewDocument isOpen={preview} documentUrl={documentUrl} onClose={()=>setPreview(false)}/>
        </div>
    )
}

export default InvoicePage