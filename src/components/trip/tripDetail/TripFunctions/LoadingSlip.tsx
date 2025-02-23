'use client'
import { useToast } from '@/components/hooks/use-toast'
import { useExpenseData } from '@/components/hooks/useExpenseData'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ITrip } from '@/utils/interface'
import { formatNumber } from '@/utils/utilArray'
import { DialogTrigger } from '@radix-ui/react-dialog'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
    trip : ITrip | any,
    charges : number | undefined,
    haltingCharges : number | undefined
}
const LoadingSlip: React.FC<Props> = ({trip, charges,haltingCharges}) => {
    const {parties} = useExpenseData()
    const [user, setUser] = useState<any>()
    const { toast } = useToast()
    const slipRef = useRef<HTMLDivElement | null>(null)
    const [pdfDownloading, setPDFDownloading] = useState(false)

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/users')
            const data = await res.json()
            setUser(data.user)
        } catch (error) {
            toast({
                description: "Failed to fetch user details",
                variant: "destructive"
            })
        }
    }

    const downloadPdf = async () => {
        const element = slipRef.current;
        if (!element) {
            console.error('Element with id "fmemo" not found');
            return;
        }

        setPDFDownloading(true);
        try {
            console.log('Capturing element as image...');
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: true,
                useCORS: true
            });

            console.log('Canvas generated. Dimensions:', canvas.width, 'x', canvas.height);
            const imgData = canvas.toDataURL('image/jpeg');
            console.log('Image data URL length:', imgData.length);

            const padding = 10; // 10mm padding on all sides
            const imgWidth = canvas.width / 2;
            const imgHeight = canvas.height / 2;
            const pdfWidth = (imgWidth * 25.4) / 96 + (padding * 2);
            const pdfHeight = (imgHeight * 25.4) / 96 + (padding * 2);

            console.log('Calculated PDF dimensions:', pdfWidth, 'x', pdfHeight, 'mm');

            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });

            const imgX = padding;
            const imgY = padding;

            console.log('Adding image to PDF...');
            pdf.addImage(imgData, 'JPEG', imgX, imgY, pdfWidth - (padding * 2), pdfHeight - (padding * 2));

            console.log('Saving PDF...');
            pdf.save(`Loading Slip-${trip.LR}-${trip.truck}.pdf`);
        } catch (error) {
            toast({
                description: "Failed to generate PDF",
                variant: "destructive"
            })
        } finally {
            setPDFDownloading(false)
        }
    }

    function numberToWordsIndian(num: number): string {
        if (num === 0) return "zero";

        const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        const teens = [
            "eleven", "twelve", "thirteen", "fourteen", "fifteen",
            "sixteen", "seventeen", "eighteen", "nineteen"
        ];
        const tens = ["", "ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        const scales = ["", "thousand", "lakh", "crore"];

        const getBelowThousand = (n: number): string => {
            let str = "";
            if (n > 99) {
                str += units[Math.floor(n / 100)] + " hundred ";
                n %= 100;
            }
            if (n >= 11 && n <= 19) {
                str += teens[n - 11] + " ";
            } else {
                if (n >= 10) {
                    str += tens[Math.floor(n / 10)] + " ";
                    n %= 10;
                }
                if (n > 0) {
                    str += units[n] + " ";
                }
            }
            return str.trim();
        };

        const parts: string[] = [];
        let scaleIndex = 0;

        while (num > 0) {
            const divisor = scaleIndex === 0 ? 1000 : 100;
            const part = num % divisor;

            if (part > 0) {
                const scale = scales[scaleIndex];
                parts.unshift(getBelowThousand(part) + (scale ? " " + scale : ""));
            }

            num = Math.floor(num / divisor);
            scaleIndex++;
        }

        return parts.join(" ").trim();
    }


    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <Dialog>
            <DialogTrigger><Button className='w-full'>Loading Slip</Button></DialogTrigger>
            <DialogContent className='max-w-4xl p-8 h-[95vh] overflow-y-auto thin-scrollbar'>
                <div ref={slipRef} className="max-3-4xl w-full mx-auto p-4 border-2 border-black">
                    <div className="text-center spacing-large ">
                        <h2 className="text-blue-500">Loading Slip</h2>
                        <div className="flex items-center spacing-large relative">

                            <div className="absolute left-4">
                                <Image src={user?.logoUrl} alt='logo' width={50} height={50} />
                            </div>

                            <div className="flex-grow text-center">
                                <h1 className="text-4xl font-bold">{user?.company}</h1>
                            </div>

                            <div className="absolute right-0">
                                <p className="text-sm">
                                    <i className="fas fa-phone-alt"></i>
                                    {user?.phone}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm mt-2 spacing-large">
                            <p>{user?.address}, {user?.city}, {user?.pincode}</p>
                            <p>{user?.email}</p>
                        </p>
                    </div>

                    <div className="spacing-large bg-blue-500 bg-opacity-45 p-2 mt-2">
                        <div className="flex justify-between">
                            <p>No: {trip?.LR || 'N/A'}</p>
                            <p>Date: {new Date(trip?.startDate).toLocaleDateString('en-IN')}</p>
                        </div>
                    </div>
                    <div className="spacing-large mt-2">
                        <p>Party/Customer. {parties.length > 0 ? parties?.find(party=>party.party_id === trip.party)?.name || '' : ''}</p>
                        <p>As per discussion with {trip?.partyName}</p>
                        <p>We are sending</p>
                    </div>
                    <div className="spacing-large mt-2">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-500 bg-opacity-45">
                                    <th className="p-2 text-center border">Vehicle No.</th>
                                    <th className="p-2 text-center border">Load</th>
                                    <th className="p-2 text-center border">From</th>
                                    <th className="p-2 text-center border">To</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-2 text-center border">{trip?.truck}</td>
                                    <td className="p-2 text-center border">{trip.material && trip?.material?.map((item : {name : string, weight : string})=>item.name + ',')}</td>
                                    <td className="p-2 text-center border">{trip?.route?.origin}</td>
                                    <td className="p-2 text-center border">{trip?.route?.destination}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="spacing-large grid grid-cols-2 gap-8 mt-2">
                        <div>
                            <div className="flex justify-between">
                                <p>Length:</p>
                                <p></p>
                            </div>
                            <div className="flex justify-between">
                                <p>Width:</p>
                                <p></p>
                            </div>
                            <div className="flex justify-between">
                                <p>Height:</p>
                                <p></p>
                            </div>
                            <div className="flex justify-between">
                                <p>Rate:</p>
                                <p>{trip?.rate}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Halting Charges:</p>
                                <p>₹{haltingCharges || 0}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Total Freight:</p>
                                <p>₹{formatNumber(trip?.amount) || 0}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <p>Other Charges:</p>
                                <p>₹{charges || 0}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Advance:</p>
                                <p>₹{formatNumber(trip?.loadingSlipDetails?.advance) || 0}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Balance Amount:</p>
                                <p>₹{formatNumber(trip?.loadingSlipDetails?.balance || trip?.balance || 0)}</p>
                            </div>

                            <div className="flex justify-between">
                                <p>Min Guaranteed Weight(M.T.):</p>
                                <p>{trip?.guaranteedWeight}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Maximum Weight(M.T.):</p>
                                <p></p>
                            </div>
                        </div>
                    </div>
                    <div className="spacing-large mt-2">
                        <div className="border border-black p-2 h-16">
                            <p><strong>Amount in Words:</strong> {numberToWordsIndian(trip?.amount)} rupees only</p>
                        </div>
                    </div>
                    <div className="mt-16 flex justify-between items-start">
                        <div className="w-1/2">
                            <div className="mb-4 space-y-2">
                                <div className="flex justify-between">
                                    <p>PAN No.:</p>
                                    <p>{user?.panNumber}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>GST No.:</p>
                                    <p>{user?.gstNumber}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>MSME No.:</p>
                                    <p>{user?.bankDetails?.msmeNo}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Account No.:</p>
                                    <p>{user?.bankDetails?.accountNo}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Bank Name:</p>
                                    <p>{user?.bankDetails?.bankName}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Branch:</p>
                                    <p>{user?.bankDetails?.bankBranch}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>IFSC Code:</p>
                                    <p>{user?.bankDetails?.ifscCode}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p>Thank You</p>
                            {user?.signatureUrl && <Image src={user.signatureUrl} alt="Signature" width={40} height={40} />}
                            <p>For {user?.companyName}</p>
                        </div>
                    </div>
                </div>
                <div className='flex justify-end'>
                    <Button onClick={() => downloadPdf()} disabled={pdfDownloading}>{pdfDownloading ? <Loader2 className='text-white animate-spin' /> : 'Download PDF'}</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LoadingSlip

