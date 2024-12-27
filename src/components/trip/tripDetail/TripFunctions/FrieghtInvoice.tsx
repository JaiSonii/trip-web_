import { useTrip } from "@/context/tripContext";
import Image from "next/image";
import { InvoiceFormData as FormData } from "@/utils/interface";


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
            if (n > 10 && n < 20) {
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
            const part = num % 1000;
            if (part > 0) {
                const scale = scales[scaleIndex];
                parts.unshift(getBelowThousand(part) + (scale ? " " + scale : ""));
            }
            num = Math.floor(num / (scaleIndex === 0 ? 1000 : 100)); // Indian system uses 100 after thousand.
            scaleIndex++;
        }

        return parts.join(" ").trim();
    }


    const totalFreightCharges = formData.freightCharges.reduce(
        (total, charge) => total + parseFloat(charge.amount),
        0
    );

    const totalAdditionalCharges = formData.additionalCharges.reduce(
        (total, charge) => total + parseFloat(charge.amount),
        0
    );

    const totalAmount = totalFreightCharges + totalAdditionalCharges;

    const totalPayments = formData.paymentDetails.reduce(
        (total, payment) => total + parseFloat(payment.amount),
        0
    );

    const balanceAmount = totalAmount - totalPayments;

    return (
        <div className="w-full mx-auto my-2 border border-black relative font-sans text-[8px]">
            <div className="text-center mb-2">FREIGHT INVOICE</div>
            <div className="flex items-center justify-center mb-2">
                <Image src={formData.logoUrl} alt="Company Logo" width={30} height={30} />
                <div className="ml-2 flex flex-col items-center justify-center">
                    <h2 className="text-sm font-semibold text-gray-800">{formData.companyName}</h2>
                    <p className="text-xs font-normal uppercase text-gray-700">Fleet Owners and Transport Contractors</p>
                </div>
            </div>
            <div className="text-center mb-1">{formData.address}</div>
            <div className="text-center mb-1">
                <span>{formData.email}</span>
            </div>
            <div className="absolute right-1 top-1">
                <div>{formData.phone}</div>
            </div>

            <table className="w-full border-collapse text-[6px]">
                <tbody>
                    <tr>
                        <td colSpan={3} className="text-center font-bold border border-l-0 border-black p-1">Bill No. {formData.billNo}</td>
                        <td className="border border-black p-1">Branch: {formData.branch}</td>
                        <td className="border border-r-0 border-black p-1">Date: {formData.date}</td>
                    </tr>
                    <tr>
                        <td colSpan={1} className="font-bold border border-l-0 border-black p-1">
                            CONSIGNMENT<br />
                            No.
                        </td>
                        <td colSpan={1} className="font-bold border border-black p-1">Date</td>
                        <td className="font-bold border border-black p-1">PARTICULARS</td>
                        <td colSpan={1} className="border border-black p-1">From: {formData.from}</td>
                        <td colSpan={1} className="border border-r-0 border-black p-1">To: {formData.to}</td>
                    </tr>
                    <tr>
                        <td className="border border-l-0 border-black p-1">{formData.freightCharges[0]?.lrNo || ''}</td>
                        <td className="border border-black p-1">{formData.date}</td>
                        <td className="border border-black p-1">{formData.particulars}</td>
                        <td colSpan={2} className="border border-r-0 border-black p-1">
                            <div>Party: {formData.party}</div>
                            <div>GSTIN: {formData.partyDetails.gstin}</div>
                            <div>{formData.address}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* <h2 className="bg-gray-300 text-center text-[7px] font-bold p-0.5 mt-2 mb-1">Freight Charges</h2>
            <table className="w-full border-collapse text-[6px]">
                <thead>
                    <tr className="border-b border-black">
                        <td className="font-bold text-center border border-black p-0.5">S.N</td>
                        <td className="font-bold text-center border border-black p-0.5">Lorry No.</td>
                        <td className="font-bold text-center border border-black p-0.5" colSpan={2}>Particulars</td>
                        <td className="font-bold text-center border border-black p-0.5">Weight (MT)</td>
                        <td className="font-bold text-center border border-black p-0.5">Charged (MT)</td>
                        <td className="font-bold text-center border border-black p-0.5">Rate (PMT)</td>
                        <td className="font-bold text-center border border-black p-0.5">Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {formData.freightCharges.map((charge, index) => (
                        <tr key={index}>
                            <td className="border border-black p-0.5">{index + 1}</td>
                            <td className="border border-black p-0.5">{charge.lorryNo}</td>
                            <td colSpan={2} className="border border-black p-0.5">{charge.particulars}</td>
                            <td className="border border-black p-0.5">{charge.weight}</td>
                            <td className="border border-black p-0.5">{charge.charges}</td>
                            <td className="border border-black p-0.5">{charge.rate}</td>
                            <td className="border border-black p-0.5">{formatCurrency(parseFloat(charge.amount))}</td>
                        </tr>
                    ))}
                </tbody>
            </table> */}

            <h2 className="bg-gray-300 text-center text-sm font-bold p-1 mt-4 mb-2">Freight Charges</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-black">
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
                            <td className="border border-black p-2">{charge.lorryNo}</td>
                            <td colSpan={2} className="border border-black p-2">{charge.expenseType}</td>
                            <td className="border border-black p-2">{charge.weight}</td>
                            <td className="border border-black p-2">{charge.charges}</td>
                            <td className="border border-black p-2">{charge.rate}</td>
                            <td className="border border-black p-2">{formatCurrency(parseFloat(charge.amount))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="bg-gray-300 text-center text-sm font-bold p-1 mt-4 mb-2">Additional Charges</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-black">
                        <td className="font-bold text-center border border-black p-2">S.N</td>
                        <td className="font-bold text-center border border-black p-2">Date</td>
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
                            <td className="border border-black p-2">{new Date(charge.date).toLocaleDateString('en-IN')}</td>
                            <td className="border border-black p-2">{charge.lorryNo}</td>
                            <td className="border border-black p-2">{charge.expenseType || 'NA'}</td>
                            <td className="border border-black p-2">{charge.remarks || 'NA'}</td>
                            <td className="border border-black p-2">{formatCurrency(parseFloat(charge.amount))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <table className="w-full border-collapse border-t border-black">
                <tbody>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>UDYAM/MSME No. {formData.partyDetails.msmeNo}</div>
                            <div>GSTIN {formData.partyDetails.gstin}</div>
                        </td>
                        <td className="font-bold text-center p-2">TOTAL</td>
                        <td className="font-bold text-right p-2 pr-2.5">₹amount</td>
                    </tr>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>PAN No {formData.partyDetails.pan}</div>
                            <div>Bank Acc No {formData.partyDetails.accNo}</div>
                        </td>
                        <td className="font-bold text-center p-2">ADVANCE</td>
                        <td className="font-bold text-right p-2 pr-2.5">{formatCurrency(totalPayments)}</td>
                    </tr>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>IFSC Code {formData.partyDetails.ifscCode}</div>
                            <div>Bank Name {formData.partyDetails.bankName}</div>
                            <div>Branch Name {formData.partyDetails.bankBranch}</div>
                        </td>
                        <td className="font-bold text-center p-2">BALANCE</td>
                        <td className="font-bold text-right p-2 pr-2.5">balance</td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="text-center font-bold text-xs p-2.5 border-t border-b border-black">
                            Total amount in words :-  {numberToWordsIndian(20000)}{/* You may want to add a utility function to convert number to words */}
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className="bg-gray-300 text-center text-sm font-bold p-1 mt-4 mb-2">Received Payment Details</h2>
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
                            <td className="border border-black p-2">{payment.date}</td>
                            <td className="border border-black p-2">{payment.paymentMode}</td>
                            <td className="border border-black p-2">{payment.notes}</td>
                            <td className="border border-black p-2">{formatCurrency(parseFloat(payment.amount))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4">For, {formData.companyName}</div>
            <div className="flex justify-around mt-5 mb-5">
                <div className="text-center text-xs">
                    <img src="signature.png" alt="Signature" className="w-[50px] h-5 mx-auto block" />
                    Checked by
                </div>
                <div className="text-center text-xs">
                    <img src="signature.png" alt="Signature" className="w-[50px] h-5 mx-auto block" />
                    Bill Incharge
                </div>
                <div className="w-[50px] h-[50px]">
                    <img src="verified_stamp.png" alt="Verified Stamp" className="w-full h-full" />
                </div>
            </div>

            <div className="text-xs font-bold">
                NOTE:
                <span className="font-normal">
                    We are not liable to accept or pay GST as Goods Transport Agency
                    (GTA) fall under Reverse Charge Mechanism (RCM).
                </span>
            </div>
        </div>
    );
};

export default FreightInvoice