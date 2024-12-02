'use client'

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTrip } from "@/context/tripContext"
import { Download, Plus, Trash2 } from 'lucide-react'
import  FreightInvoice  from "./FrieghtInvoice"
import { useToast } from "@/components/hooks/use-toast"

export interface FormData {
    logoUrl: string;
    billNo: string;
    date: string;
    to: string;
    from: string;
    branch: string;
    address: string;
    particulars: string;
    party: string;
    companyName : string;
    phone : string
    email : string;
    freightCharges: {
        lrNo: string;
        lorryNo: string;
        particulars: string;
        weight: string;
        charges: string;
        rate: string;
        amount: string;
    }[];
    additionalCharges: {
        sNo: number;
        lorryNo: string;
        particulars: string;
        remarks: string;
        amount: string;
    }[];
    partyDetails: {
        msmeNo: string;
        gstin: string;
        pan: string;
        accNo: string;
        ifscCode: string;
        bankName: string;
        bankBranch: string;
    };
    paymentDetails: {
        sNo: number;
        date: string;
        paymentMode: string;
        notes: string;
        amount: string;
    }[];
}

export default function InvoiceForm({ setShow }: { setShow: React.Dispatch<React.SetStateAction<boolean>> }) {
    const { trip } = useTrip()
    const [showInvoice, setShowInvoice] = useState(false)
    const [user, setUser] = useState<any>(null)
    const {toast} = useToast()
    const [formData, setFormData] = useState<FormData>({
        logoUrl: '',
        billNo: '',
        companyName :'',
        email : '',
        phone : '',
        date: new Date().toISOString().split('T')[0],
        to: trip.route?.origin || '',
        from: trip.route?.destination || '',
        branch: '',
        address: '',
        particulars: '',
        party: trip.partyName || '',
        freightCharges: [{ lrNo: '', lorryNo: '', particulars: '', weight: '', charges: '', rate: '', amount: '' }],
        additionalCharges: [{ sNo: 1, lorryNo: '', particulars: '', remarks: '', amount: '' }],
        partyDetails: {
            msmeNo: trip.partyDetails?.msmeNo || '',
            gstin: trip.partyDetails?.gstNumber || '',
            pan: trip.partyDetails?.pan || '',
            accNo: '',
            ifscCode: '',
            bankName: '',
            bankBranch: ''
        },
        paymentDetails: [{ sNo: 1, date: '', paymentMode: '', notes: '', amount: '' }]
    })

    const fetchUser = async () => {
        try {
          const [res] = await Promise.all([fetch('/api/users')])
          if (!res.ok ) {
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
            freightCharges: trip.tripCharges?.map((charge: any) => ({
                lrNo: trip.LR || '',
                lorryNo: trip.truck || '',
                particulars: charge.expenseType || '',
                weight: 'FTL',
                charges: 'NA',
                rate: 'Fixed',
                amount: charge.amount?.toString() || '0',
            })) || [],
            paymentDetails: trip.tripAccounts?.map((charge: any, index: number) => ({
                sNo: index + 1,
                date: new Date(charge.date).toISOString().split('T')[0] || '',
                notes: charge.notes || '',
                paymentMode: charge.paymentType || '',
                amount: charge.amount?.toString() || '0',
            })) || [],
        }));
          
        } catch (error) {
          alert('Failed to fetch User Details')
        }
      }

    useEffect(() => {
        fetchUser()
    }, [trip]);

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
                i === index ? { ...item, [field]: value } : item
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

    const removeRow = (section: 'freightCharges' | 'additionalCharges' | 'paymentDetails', index: number) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }))
    }

    const handleDownload = () => {
        const invoiceContent = document.getElementById('invoice-content');
        if (invoiceContent) {
            const html = invoiceContent.outerHTML;
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${formData.billNo}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowInvoice(true);
    }

    return (
        <Card className="w-full max-w-7xl mx-auto max-h-[98vh] overflow-auto thin-scrollbar">
            <CardContent className="p-6">
                {!showInvoice ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Invoice Details */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo</Label>
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="billNo">Bill No.</Label>
                                <input
                                    id="billNo"
                                    value={formData.billNo}
                                    onChange={(e) => handleInputChange('billNo', 'billNo', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', 'date', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <input
                                    id="to"
                                    value={formData.to}
                                    onChange={(e) => handleInputChange('to', 'to', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <input
                                    id="from"
                                    value={formData.from}
                                    onChange={(e) => handleInputChange('from', 'from', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branch">Invoicing Branch</Label>
                                <input
                                    id="branch"
                                    value={formData.branch}
                                    onChange={(e) => handleInputChange('branch', 'branch', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', 'address', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="particulars">Particulars</Label>
                                <input
                                    id="particulars"
                                    value={formData.particulars}
                                    onChange={(e) => handleInputChange('particulars', 'particulars', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="party">Party</Label>
                                <input
                                    id="party"
                                    value={formData.party}
                                    onChange={(e) => handleInputChange('party', 'party', e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Freight Charges */}
                        <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                            <h3 className="font-semibold">Freight Charges</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
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
                                        {formData.freightCharges.map((charge, index) => (
                                            <tr key={index}>
                                                {Object.keys(charge).map((key) => (
                                                    <td key={key} className="p-2">
                                                        <input
                                                            value={charge[key as keyof typeof charge]}
                                                            onChange={(e) => handleArrayInputChange('freightCharges', index, key, e.target.value)}
                                                            className="rounded-lg"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="p-2">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => removeRow('freightCharges', index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => addRow('freightCharges')}
                                className="rounded-full"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Additional Charges */}
                        <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                            <h3 className="font-semibold">Additional Charges</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="p-2">S.No</th>
                                            <th className="p-2">Lorry No.</th>
                                            <th className="p-2">Particulars</th>
                                            <th className="p-2">Remarks</th>
                                            <th className="p-2">Amount(MT)</th>
                                            <th className="p-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.additionalCharges.map((charge, index) => (
                                            <tr key={index}>
                                                <td className="p-2">{charge.sNo}</td>
                                                {['lorryNo', 'particulars', 'remarks', 'amount'].map((key) => (
                                                    <td key={key} className="p-2">
                                                        <input
                                                            value={charge[key as keyof typeof charge]}
                                                            onChange={(e) => handleArrayInputChange('additionalCharges', index, key, e.target.value)}
                                                            className="rounded-lg"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="p-2">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => removeRow('additionalCharges', index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => addRow('additionalCharges')}
                                className="rounded-full"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Party Details */}
                        <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                            <h3 className="font-semibold">Party Details</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {Object.entries(formData.partyDetails).map(([key, value]) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key}>{key.toUpperCase()}</Label>
                                        <input
                                            id={key}
                                            value={value}
                                            onChange={(e) => handleInputChange('partyDetails', key, e.target.value)}
                                            className="rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                            <h3 className="font-semibold">Payment Details</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
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
                                                <td className="p-2">{payment.sNo}</td>
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
                                                        onClick={() => removeRow('paymentDetails', index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => addRow('paymentDetails')}
                                className="rounded-full"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-end gap-4">
                            <Button variant={'outline'} className="" onClick={() => setShow(false)}>Cancel</Button>
                            <Button type="submit" className="">Generate Invoice</Button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div id="invoice-content">
                            <FreightInvoice formData={formData} />
                        </div>
                        <div className="mt-4 flex justify-between">
                            <Button onClick={() => setShowInvoice(false)} variant="outline">
                                Back to Form
                            </Button>
                            <Button onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" /> Download Invoice
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

