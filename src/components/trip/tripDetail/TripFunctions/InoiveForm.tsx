'use client'

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTrip } from "@/context/tripContext"
import { Download, Plus, Trash2 } from 'lucide-react'
import FreightInvoice from "./FrieghtInvoice"
import { useToast } from "@/components/hooks/use-toast"
import ChargeModal from "../ChargeModal"
import { v4 as uuidv4 } from 'uuid'
import { InvoiceFormData as FormData } from '@/utils/interface'

type AdditionalCharge = {

}

type Props = {
    setShow?: React.Dispatch<React.SetStateAction<boolean>>,
    trips: any[],
    formData: FormData,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>
    setDeletedChargeIds: React.Dispatch<React.SetStateAction<string[]>>
    setDeletedPaymentIds: React.Dispatch<React.SetStateAction<string[]>>
}


export default function InvoiceForm({ setShow, trips, formData, setFormData, setDeletedChargeIds, setDeletedPaymentIds }: Props) {
    const [showInvoice, setShowInvoice] = useState(false)
    const [user, setUser] = useState<any>(null)
    const { toast } = useToast()
    const [chargeModalOpen, setChargeModalOpen] = useState(false)


    const addAddtionalCharge = (data: any) => {

        setFormData((prev: any) => ({
            ...prev,
            additionalCharges: [
                {
                    ...data,
                    id: uuidv4(),
                    truckNo: trips.find(trip => trip.trip_id === data.trip_id).truck,
                },
                ...prev.additionalCharges
            ]

        }))
    }

    const deleteAddtionalCharge = (id: string) => {
        setFormData(prev => ({
            ...prev,
            additionalCharges: prev.additionalCharges.filter((item: any) => item.id !== id)
        }))
    }

    const fetchUser = async () => {
        try {
            const [res] = await Promise.all([fetch('/api/users')])
            if (!res.ok) {
                toast({
                    description: 'Failed to fetch Details',
                    variant: 'destructive'
                })
                return
            }
            const data = await res.json()
            const user = data.user
            setUser(user)
            setFormData((prev) => ({
                ...prev,
                companyName: user.company,
                address: user.address,
                phone: user.phone,
                gstin: user.gstNumber,
                logoUrl: user.logoUrl,
                pincode: user.pincode,
                email: user.email,
                city: user.city,
                pan: user.panNumber,
                partyDetails: {
                    ...prev.partyDetails,
                    msmeNo: user.bankDetails?.msmeNo || '',
                    gstin: user.gstNumber || '',
                    pan: user.panNumber || '',
                    accNo: user.bankDetails?.accountNo || '',
                    ifscCode: user.bankDetails?.ifscCode || '',
                    bankName: user.bankDetails?.bankName || '',
                    bankBranch: user.bankDetails?.bankBranch || '',
                }
            }));

            console.log(formData.paymentDetails)

        } catch (error) {
            alert('Failed to fetch User Details')
        }
    }

    useEffect(() => {
        fetchUser()
    }, [trips]);

    const handleInputChange = (section: keyof FormData, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: typeof prev[section] === 'object' && !Array.isArray(prev[section])
                ? { ...prev[section] as object, [field]: value }
                : value
        }))
    }

    const handleArrayInputChange = (
        section: 'freightCharges' | 'additionalCharges' | 'paymentDetails',
        index: number,
        field: string,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value, edited: true } : item
            )
        }))
    }

    const addRow = (section: 'freightCharges' | 'additionalCharges' | 'paymentDetails') => {
        setFormData(prev => ({
            ...prev,
            [section]: [
                ...prev[section],
                section === 'freightCharges'
                    ? { lrNo: '', lorryNo: '', particulars: '', weight: '', charges: '', rate: '', amount: '' }
                    : section === 'additionalCharges'
                        ? { sNo: prev[section].length + 1, lorryNo: '', particulars: '', remarks: '', amount: '' }
                        : { sNo: prev[section].length + 1, date: '', paymentMode: '', notes: '', amount: '' }
            ]
        }))
    }

    const removeRow = (section: 'freightCharges' | 'additionalCharges' | 'paymentDetails', index: number, id: string) => {
        if (section === 'freightCharges') {
            setDeletedChargeIds((prev) => {
                return prev.length === 0 ? [id] : [...prev, id]
            })
        } else if (section === 'paymentDetails') {
            setDeletedPaymentIds((prev) => {
                return prev.length === 0 ? [id] : [...prev, id]
            })
        }
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }))
    }

    // const handleDownload = () => {
    //     const invoiceContent = document.getElementById('invoice-content');
    //     if (invoiceContent) {
    //         const html = invoiceContent.outerHTML;
    //         const blob = new Blob([html], { type: 'text/html' });
    //         const url = URL.createObjectURL(blob);
    //         const a = document.createElement('a');
    //         a.href = url;
    //         a.download = `invoice_${formData.billNo}.html`;
    //         document.body.appendChild(a);
    //         a.click();
    //         document.body.removeChild(a);
    //         URL.revokeObjectURL(url);
    //     }
    // }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowInvoice(true);
    }

    return (
        <div>
            {!showInvoice ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Invoice Details */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
                        {/* <div className="space-y-2">
                            <label htmlFor="logo">Logo</label>
                            <input
                                id="logo"
                                type="file"
                                className="cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                            handleInputChange('logoUrl', 'logoUrl', reader.result as string)
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                            />
                        </div> */}
                        <div className="space-y-2">
                            <label htmlFor="billNo">Bill No.</label>
                            <input
                                id="billNo"
                                value={formData.billNo}
                                onChange={(e) => handleInputChange('billNo', 'billNo', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', 'date', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="to">To</label>
                            <input
                                id="to"
                                value={formData.to}
                                onChange={(e) => handleInputChange('to', 'to', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="from">From</label>
                            <input
                                id="from"
                                value={formData.from}
                                onChange={(e) => handleInputChange('from', 'from', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="branch">Invoicing Branch</label>
                            <input
                                id="branch"
                                value={formData.branch}
                                onChange={(e) => handleInputChange('branch', 'branch', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="address">Address</label>
                            <input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', 'address', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="particulars">Particulars</label>
                            <input
                                id="particulars"
                                value={formData.particulars}
                                onChange={(e) => handleInputChange('particulars', 'particulars', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="party">Party</label>
                            <input
                                id="party"
                                value={formData.party}
                                onChange={(e) => handleInputChange('party', 'party', e.target.value)}
                                className="rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    {/* Freight Charges */}
                    <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-semibold text-sm">Freight Charges</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr>
                                        <th className="p-2">LR No.</th>
                                        <th className="p-2">Lorry No.</th>
                                        <th className="p-2">Particulars</th>
                                        <th className="p-2">Weight(MT)</th>
                                        <th className="p-2">Charges(MT)</th>
                                        <th className="p-2">Rate(MT)</th>
                                        <th className="p-2">Amount(MT)</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.freightCharges.map((charge: any, index) => (
                                        <tr key={index}>
                                            {Object.keys(charge).map((key) => (
                                                key !== '_id' && key !== 'edited' && ( // Use `&&` to ensure both conditions are met
                                                    <td key={key} className="p-2">
                                                        <input
                                                            value={charge[key]}
                                                            onChange={(e) =>
                                                                handleArrayInputChange('freightCharges', index, key, e.target.value)
                                                            }
                                                            className="rounded-lg"
                                                        />
                                                    </td>
                                                )
                                            ))}
                                            <td className="p-2">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeRow('freightCharges', index, charge._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Additional Charges */}
                    <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-semibold text-sm">Additional Charges</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr>
                                        <th className="p-2">S.No</th>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Lorry No.</th>
                                        <th className="p-2">Particulars</th>
                                        <th className="p-2">Remarks</th>
                                        <th className="p-2">Amount(MT)</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.additionalCharges.length > 0 && formData.additionalCharges?.map((charge, index) => (
                                        <tr key={index}>
                                            <td className="p-2">{index + 1}</td>
                                            {['date', 'truckNo', 'expenseType', 'notes', 'amount'].map((key) => (
                                                <td key={key} className="p-2">
                                                    {key === 'date' ?
                                                        <input type="date" value={new Date(charge['date']).toISOString().split('T')[0] || ''}
                                                            onChange={(e) => handleArrayInputChange('additionalCharges', index, key, e.target.value)}
                                                            className="rounded-lg" />
                                                        :
                                                        <input
                                                            value={charge[key as keyof typeof charge]}
                                                            onChange={(e) => handleArrayInputChange('additionalCharges', index, key, e.target.value)}
                                                            className="rounded-lg"
                                                        />
                                                    }

                                                </td>
                                            ))}
                                            <td className="p-2">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => deleteAddtionalCharge(charge.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setChargeModalOpen(true)}
                                className="rounded-full flex justify-center"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                    </div>

                    {/* Party Details */}
                    <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-semibold text-sm">Party Details</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(formData.partyDetails).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <label htmlFor={key}>{key.toUpperCase()}</label>
                                    <input
                                        id={key}
                                        value={value}
                                        onChange={(e) => handleInputChange('partyDetails', key, e.target.value)}
                                        className="rounded-lg text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-semibold text-sm">Payment Details</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr>
                                        <th className="p-2">S.No</th>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Payment Mode</th>
                                        <th className="p-2">Notes</th>
                                        <th className="p-2">Amount</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.paymentDetails.map((payment, index) => (
                                        <tr key={index}>
                                            <td className="p-2">{index + 1}</td>
                                            <td className="p-2">
                                                <input
                                                    type="date"
                                                    value={payment.date}
                                                    onChange={(e) => handleArrayInputChange('paymentDetails', index, 'date', e.target.value)}
                                                    className="rounded-lg"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    value={payment.paymentMode}
                                                    onChange={(e) => handleArrayInputChange('paymentDetails', index, 'paymentMode', e.target.value)}
                                                    className="rounded-lg"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    value={payment.notes}
                                                    onChange={(e) => handleArrayInputChange('paymentDetails', index, 'notes', e.target.value)}
                                                    className="rounded-lg"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    value={payment.amount}
                                                    onChange={(e) => handleArrayInputChange('paymentDetails', index, 'amount', e.target.value)}
                                                    className="rounded-lg"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeRow('paymentDetails', index, payment._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setChargeModalOpen(true)}
                                className="rounded-full"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                    </div>
                </form>
            ) : (
                null
            )}

            <ChargeModal trips={trips} isOpen={chargeModalOpen} onClose={() => setChargeModalOpen(false)} onSave={(data: any) => addAddtionalCharge(data)} />
        </div>
    )
}

