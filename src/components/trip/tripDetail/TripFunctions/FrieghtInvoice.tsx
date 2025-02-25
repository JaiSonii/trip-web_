
import Image from "next/image";
import { InvoiceFormData as FormData } from "@/utils/interface";
import { formatNumber } from "@/utils/utilArray";
import { useMemo } from "react";


const FreightInvoice: React.FC<{ formData: FormData }> = ({ formData }) => {
    // const {trip} = useTrip()

    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    const totalAmount = formData.freightCharges.reduce(
        (total, charge) => {
            const amount = parseFloat(charge.amount as any); // Safely convert to a number
            return total + (isNaN(amount) ? 0 : amount); // Add only valid numbers
        },
        0
    ) + formData.additionalCharges.reduce((total, charge)=>total + Number(charge.amount),0) + formData.extraAdditionalCharges.reduce((total,charge)=>total + Number(charge.amount),0);

    const totalBalance = useMemo(() => {
        // Combine paymentDetails and extraPaymentDetails into a single array
        const allPayments = [
            ...(formData.paymentDetails || []),
            ...(formData.extraPaymentDetails || []),
        ];

        // Calculate the total payment amount
        const paymentTotal = allPayments.reduce((total, charge) => {
            const amount = parseFloat(charge.amount as any); // Safely convert to a number
            return total + (isNaN(amount) ? 0 : amount); // Add only valid numbers
        }, 0);

        // Return the total balance
        return totalAmount - paymentTotal;
    }, [formData, totalAmount]);



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


    return (
        <div className="w-full mx-auto my-2 border border-black relative font-sans text-[8px] pb-4">
            <div className="text-center mb-2">FREIGHT INVOICE</div>
            <div className="flex items-center justify-center mb-2">
                <Image src={formData.logoUrl} alt="Company Logo" width={30} height={30} />
                <div className="ml-2 flex flex-col items-center justify-center">
                    <h2 className="text-sm font-semibold text-gray-800">{formData.companyName}</h2>
                    <p className="text-xs font-normal uppercase text-gray-700">Fleet Owners and Transport Contractors</p>
                </div>
            </div>
            <div className="text-center mb-1">{formData.address}</div>
            <div className="absolute right-1 top-1">
                <div>{formData.phone}</div>
                <div>{formData.altPhone}</div>
            </div>
            <table className="w-full border-collapse text-[6px]">
                <tbody>
                    <tr>
                        <td colSpan={3} className="text-center font-bold border border-l-0 border-black p-1">Bill No. {formData.billNo}</td>
                        <td className="border border-black p-1">Branch: {formData.branch}</td>
                        <td className="border border-r-0 border-black p-1">Date: {new Date(formData.date).toLocaleDateString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td colSpan={1} className="font-bold border border-l-0 border-black p-1">CONSIGNMENT<br />No. </td>
                        <td colSpan={1} className="font-bold border border-black p-1">Date</td>
                        <td className="font-bold border border-black p-1">PARTICULARS</td>
                        <td colSpan={1} className="border border-black p-1">From: {formData.from}</td>
                        <td colSpan={1} className="border border-r-0 border-black p-1">To: {formData.to}</td>
                    </tr>
                    <tr>
                        <td className="border border-l-0 border-black p-1">{formData.freightCharges.map((charge, index)=><span key={index}>{charge.lrNo}{index === formData.freightCharges.length -1 ? '' : ', '}</span>)}</td>
                        <td className="border border-black p-1">{new Date(formData.date).toLocaleDateString('en-IN')}</td>
                        <td className="border border-black p-1">{formData.particulars}</td>
                        <td colSpan={2} className="border border-r-0 border-black p-1">
                            <div>Party: {formData.party}</div>
                            <div>GSTIN: {formData.partygst }</div>
                            <div>{formData.partyAddress}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className=" text-center text-xs font-bold p-2 mt-2 mb-1" style={ {background : formData.color}}>Freight Charges</h2>
            <table className="w-full border-collapse text-[6px]">
                <thead>
                    <tr className="">
                        <td className="font-bold text-center border border-black p-2">S.N</td>
                        <td className="font-bold text-center border border-black p-2">Lorry No.</td>
                        <td className="font-bold text-center border border-black p-2" colSpan={2}>Particulars</td>
                        <td className="font-bold text-center border border-black p-2">Weight (MT)</td>
                        <td className="font-bold text-center border border-black p-2">Charged (MT)</td>
                        <td className="font-bold text-center border border-black p-2">Rate (PMT)</td>
                        <td className="font-bold text-center border border-black p-2">Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {formData.freightCharges.map((charge, index) => (
                        <tr key={index}>
                            <td className="border border-black p-2">{index + 1}</td>
                            <td className="border border-black p-2">{charge.truckNo}</td>
                            <td colSpan={2} className="border border-black p-2">{charge.material?.map((item,i)=>item + (i === charge.material.length - 1 ? '' : ', ')) || ''}</td>
                            <td className="border border-black p-2">{charge.weight}</td>
                            <td className="border border-black p-2">{charge.charged}</td>
                            <td className="border border-black p-2">{charge.rate}</td>
                            <td className="border border-black p-2">{formatNumber(charge.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {(formData.additionalCharges.length !== 0 || formData.extraAdditionalCharges.length !== 0) &&
                <>
                    <h2 className="text-center text-xs font-bold p-2 mt-4 mb-2" style={{background : formData.color}}>Additional Charges</h2>

                    <table className="w-full ">
                        <thead>
                            <tr className="">
                                <td className="font-bold text-center border border-black p-2">S.N</td>
                                <td className="font-bold text-center border border-black p-2">Lorry No.</td>
                                <td className="font-bold text-center border border-black p-2">Particulars</td>
                                <td className="font-bold text-center border border-black p-2">Remarks</td>
                                <td className="font-bold text-center border border-black p-2">Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.additionalCharges.map((charge, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-2">{index + 1}</td>
                                    <td className="border border-black p-2">{charge.truckNo}</td>
                                    <td className="border border-black p-2">{charge.expenseType}</td>
                                    <td className="border border-black p-2">{charge.notes}</td>
                                    <td className="border border-black p-2">{formatNumber(charge.amount)}</td>
                                </tr>
                            ))}
                            {formData.extraAdditionalCharges.map((charge, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-2">{index + 1}</td>
                                    <td className="border border-black p-2">{charge.truckNo}</td>
                                    <td className="border border-black p-2">{charge.expenseType}</td>
                                    <td className="border border-black p-2">{charge.notes}</td>
                                    <td className="border border-black p-2">{formatNumber(charge.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table></>}

            <table className="w-full border-collapse border-t border-black">
                <tbody>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>UDYAM/MSME No. {formData.partyDetails.msmeNo}</div>
                            <div>GSTIN {formData.partyDetails.gstin}</div>
                        </td>
                        <td className="font-bold text-center p-2">TOTAL</td>
                        <td className="font-bold text-right p-2 pr-2.5">{formatNumber(totalAmount)}</td>
                    </tr>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>PAN No {formData.partyDetails.pan}</div>
                            <div>Bank Acc No {formData.partyDetails.accNo}</div>
                        </td>
                        <td className="font-bold text-center p-2">ADVANCE</td>
                        <td className="font-bold text-right p-2 pr-2.5">{formatNumber(totalAmount - totalBalance)}</td>
                    </tr>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>IFSC Code {formData.partyDetails.ifscCode}</div>
                            <div>Bank Name {formData.partyDetails.bankName}</div>
                            <div>Branch Name {formData.partyDetails.bankBranch}</div>
                        </td>
                        <td className="font-bold text-center p-2">BALANCE</td>
                        <td className="font-bold text-right p-2 pr-2.5">{formatNumber(totalBalance)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="text-center font-bold text-xs p-2.5 border-t border-b border-black">
                            Total amount in words :- {numberToWordsIndian(totalAmount)} rupees only
                        </td>
                    </tr>
                </tbody>
            </table>

            {(formData.paymentDetails.length !== 0 || formData.extraPaymentDetails.length !== 0) && <>
                <h2 className="text-center text-sm font-bold p-1 mt-4 mb-2" style={{background : formData.color}}>Received Payment Details</h2>

                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-black">
                            <td className="font-bold text-center border border-black p-2">S.N</td>
                            <td className="font-bold text-center border border-black p-2">Date</td>
                            <td className="font-bold text-center border border-black p-2">Payment Mode</td>
                            <td className="font-bold text-center border border-black p-2">Notes</td>
                            <td className="font-bold text-center border border-black p-2">Amount (-)</td>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.paymentDetails.map((payment, index) => (
                            <tr key={index}>
                                <td className="border border-black p-2">{index + 1}</td>
                                <td className="border border-black p-2">{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                                <td className="border border-black p-2">{payment.paymentType}</td>
                                <td className="border border-black p-2">{payment.notes}</td>
                                <td className="border border-black p-2">{formatNumber(payment.amount)}</td>
                            </tr>
                        ))}
                        {formData.extraPaymentDetails.map((payment, index) => (
                            <tr key={index}>
                                <td className="border border-black p-2">{index + 1}</td>
                                <td className="border border-black p-2">{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                                <td className="border border-black p-2">{payment.paymentType}</td>
                                <td className="border border-black p-2">{payment.notes}</td>
                                <td className="border border-black p-2">{formatNumber(payment.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table></>}

            <div className="mt-4">For, {formData.companyName}</div>
            <div className="flex items-center justify-evenly space-x-4 text-xs">
                {/* <div className="text-center flex flex-col items-center">
                    <div className="w-[50px] h-[50px]">
                        {formData.logoUrl ? (
                            <Image
                                src={formData.logoUrl}
                                alt="Logo"
                                width={50}
                                height={50}
                                className="object-contain"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200"></div> // Placeholder
                        )}
                    </div>
                    <p className="mt-1">Checked by</p>
                </div> */}
                <div className="text-center flex flex-col items-center">
                    <div className="w-[50px] h-[50px]">
                        {formData.signatureUrl ? (
                            <Image
                                src={formData.signatureUrl}
                                alt="Signature"
                                width={50}
                                height={50}
                                className="object-contain"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200"></div> // Placeholder
                        )}
                    </div>
                    <p className="mt-1">Bill Incharge</p>
                </div>
                <div className="text-center flex flex-col items-center">
                    <div className="w-[100px] h-[50px]">
                        {formData.stampUrl ? (
                            <Image
                                src={formData.stampUrl}
                                alt="Verified Stamp"
                                width={100}
                                height={100}
                                className="object-contain"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200"></div> // Placeholder
                        )}
                    </div>
                    <p className="mt-1">Verified Stamp</p>
                </div>
            </div>



            <div className="text-xs font-bold mt-2">
                NOTE:
                <span className="font-normal text-xs">
                    We are not liable to accept or pay GST as Goods Transport Agency
                    (GTA) fall under Reverse Charge Mechanism (RCM).
                </span>
            </div>
        </div>
    );
};

export default FreightInvoice