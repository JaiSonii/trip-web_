
import Image from "next/image";
import { useState, useEffect } from "react";
import { getBestLogoColor } from "./imgColor";
import { Card } from "@/components/ui/card";
import { formatNumber } from "./utilArray";
import { EWBFormDataType, FMDataType, PaymentBook } from "./interface";




function CompanyHeader({ formData }: { formData: { logo: string; companyName: string } }) {
  const [dominantColor, setDominantColor] = useState("black");

  useEffect(() => {
    async function fetchDominantColor() {
      try {
        const color = await getBestLogoColor(formData.logo);
        setDominantColor(color);
      } catch (error) {
        console.error("Failed to fetch dominant color:", error);
        setDominantColor("black"); // Fallback color
      }
    }

    if (formData.logo) {
      fetchDominantColor();
    }
  }, [formData.logo]);

  return (
    <h1
      className={`text-3xl font-bold`}
      style={{ color: dominantColor }}
    >
      {formData.companyName}
    </h1>
  );
}

export function Bilty({ formData, color, selectedCopy }: { formData: EWBFormDataType, color: string, selectedCopy: string }) {

  return (
    <div className={`border-2 border-black  w-full h-auto ${color} relative max-w-7xl`}>
      <section className="px-6 py-2 w-full">
        <div className="flex items-center gap-8 justify-center">
          <div className="flex justify-center">
            {formData.logo ?
              <div>
                <Image src={formData.logo} alt='logo' width={70} height={70} className='' />
              </div>
              :
              null
            }
          </div>
          <div className="text-center py-2 border-b border-black">
            <CompanyHeader formData={formData} />
            <h2 className="text-xl font-normal text-gray-700">FLEET OWNERS & TRANSPORT CONTRACTOR</h2>
            <span className=" text-gray-600 whitespace-nowrap">
              {formData.address}, {formData.city}, {formData.pincode}
            </span>
          </div>

          <div className="text-right text-gray-700 absolute top-2 right-2">
            <div className="flex items-center gap-1">
              <div>
                {/* <Image src="https://img.icons8.com/ios-filled/50/000000/phone.png" alt="Phone Icon"
                  height={20} width={20} /> */}
              </div>
              <div>
                <p className="text-xs">{formData.contactNumber}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-6 mt-8">
        <div className="col-span-3">
          <section className="">
            <div className="grid grid-cols-3 gap-2">
              <div className=" col-span-1 border-y-2 border-r-2 border-black">
                <p className="text-xs font-semibold text-black text-left mb-2 whitespace-nowrap p-2 border-b-2 border-black ">SCHEDULE OF
                  DEMURRAGE</p>
                <p className="text-xs text-black whitespace-nowrap pl-1">Demurrage chargebl after…………… days</p>
                <p className="text-xs text-black whitespace-nowrap pl-1">from today@RS…….……… perday per Qtl.</p>
                <p className="text-xs text-black whitespace-nowrap pl-1"> On weight charged</p>
              </div >
              <div className="flex flex-col ">
                <span
                  className=" font-semibold text-center p-2 border-b-2 border-black text-[#FF0000] whitespace-nowrap ">{selectedCopy.toUpperCase() + " COPY"}</span>
                <span
                  className=" font-normal text-center p-2 border-b-2 border-black text-black whitespace-nowrap">AT
                  CARRIERS RISK</span>
                <span
                  className="text-black  font-semibold text-center p-2 whitespace-nowrap">INSURANCE</span>
              </div>
              <div className="flex-col w-full col-span-1">
                <div className="border-2 p-2 border-black ">
                  <p className="text-sm text-black text-center font-semibold">Caution</p>
                  <p className="text-xs text-black" style={{ fontSize: "10px" }}>This Consignment will not be
                    detaineddiverted. rerouted or rebooked
                    withoutConsignee Bank&apos;s written permission.Will be delivered at the destination</p>
                </div>

                <div className="py-1 text-black border-b border-black">
                  <span className="text-xs font-semibold ">Address of Delivery Office :</span>
                </div>
                <div className="flex gap-24 text-xs font-semibold">
                  <p>State :</p>
                  <p>Tel : {formData.consignee.contactNumber}</p>
                </div>
              </div>
            </div>
          </section>

          <section className=" mt-4">
            <div className="grid grid-cols-9 gap-2 items-end">
              <div className="border-2 border-[#FF0000] text-[#FF0000] p-2 border-l-0 col-span-3 h-auto pb-2">
                <h3 className="text-xs text-[#FF0000] text-center">NOTICE</h3>
                <p className=" text-[10px]">The consignment covered by this Lorry ceipt shall be stored
                  at the destination Under the control of the Transport Operator
                  and shall be delivered to or to the order of the Consignee
                  Bank whose name is mentioned in the Lorry Receipt. It will
                  under no circumstances be delivered to anyone without the
                  written authority from the Consignee banker or its order.
                  endorsed on the Consignee copy</p>
              </div>
              <div className="col-span-3 border-2 border-black p-2 text-xs text-black h-auto">
                <p>The Customer has stated that:</p>
                <p>He has insured the consignment Company ………………</p>
                <p>Policy No. ……… Date ……</p>
                <p>Amount …………… Date ………</p>
              </div>
              <div className="col-span-3 text-xs text-black p-2 border-2 border-black flex flex-col gap-1 h-auto pb-2">
                <span className="text-xs">CONSIGNMENT NOTE</span>
                <span>No. : <span className='text-red-600 font-semibold'>{formData.LR}</span></span>
                <span>Date : <span className='text-red-600 font-semibold'>{new Date(formData.date).toLocaleDateString('en-IN')}</span></span>
              </div>




            </div>
          </section>

          <section className="mt-4">
            <div className="grid grid-cols-9 gap-2 items-start">

              <div className="col-span-6 font-semibold text-black border-t-2 border-black h-auto text-sm">
                <div className="border-b-2 border-r-2 border-black px-2 pb-6 flex gap-2 items-center">
                  <p>Consigner Name and Address :</p>
                  <p className="text-red-600">{formData.consigner.name + " " + formData.consigner.address + ', ' + formData.consigner.city + ', ' + formData.consigner.pincode}</p>
                </div>
                <div className="border-b-2 border-r-2 border-black px-2 pb-6 flex gap-2 items-center">
                  <p>Consignee Name and Address :</p>
                  <p className="text-red-600">{formData.consignee.name + " " + formData.consignee.address + ', ' + formData.consignee.city + ', ' + formData.consigner.pincode}</p>
                </div>
              </div>


              <div className="col-span-3 text-xs text-black h-auto">
                <div className="space-y-1">
                  <p className="border-2 border-black p-2 text-red-600 flex items-center">
                    <span className="text-black mr-1">From:</span>{formData.from}
                  </p>
                  <p className="border-2 border-black p-2 text-red-600 flex items-center">
                    <span className="text-black mr-1">To:</span>{formData.to}
                  </p>
                </div>
              </div>
            </div>
          </section>


          <section className=" mt-2">
            <table className="table-fixed w-full text-xs border border-black border-collapse">
              <thead className="font-semibold text-center">
                <tr>
                  <th className="border border-black p-2" rowSpan={2}>Packages</th>
                  <th className="border border-black p-2" rowSpan={2}>Description (said to contain)</th>
                  <th className="border border-black p-0" colSpan={2}>
                    <p className="p-2">Weight (MT)</p>
                    <div className="grid grid-cols-2 border-t border-black">
                      <div className="border-r border-black p-2">Actual</div>
                      <div className="border-l border-black p-2">Charged</div>
                    </div>
                  </th>
                  <th className="border border-black p-2" rowSpan={2}>Rate</th>
                  <th className="border border-black p-2" rowSpan={2}>Amount to pay/paid</th>
                </tr>
              </thead>

              <tbody className="text-center text-red-600 font-semibold">
                {formData.materials.map((item, index: number) => (
                  <tr key={index}>
                    <td className="border border-black p-2">{index + 1}</td>
                    <td className="border border-black p-2">{item.name}</td>
                    <td className="border border-black p-2">{item.weight} {['fixed', 'ftl'].includes(item.weight.toLowerCase()) ? "" : "MT"}</td>

                    {index === 0 && <>
                      <td className="border border-black p-2" rowSpan={formData.materials.length}>
                        <div className="h-full flex items-center justify-center">
                          {formData.grtdWeight} {['fixed', 'ftl'].includes(formData.grtdWeight.toString().toLowerCase()) ? "" : "MT"}
                        </div>
                      </td>
                      <td className="border border-black p-2" rowSpan={formData.materials.length}>
                        <div className='flex flex-col gap-3 text-black text-left'>
                          <p>Mazdoor</p>
                          <p>Hire Charges</p>
                          <p>Sur. Ch.</p>
                          <p>St. Ch.</p>
                          <p>Risk Ch.</p>
                          <p className='mt-2 text-xs'>TOTAL</p>
                        </div>
                      </td>
                      <td className="border border-black p-2" rowSpan={formData.materials.length}>
                        <div className='flex flex-col justify-between h-full'>
                          <div className='flex font-semibold gap-4 flex-col items-center py-3 justify-between'>
                            <p>TO</p>
                            <p>BE</p>
                            <p>BILLED</p>
                          </div>
                          <div className='border-t border-black h-1'></div>
                        </div>
                      </td>
                    </>}

                  </tr>
                ))}
              </tbody>
            </table>



          </section>

        </div>
        <div className="col-span-1 border-2 border-black border-r-0">
          <div className="text-[11px] border-b-2 border-black">
            <div className="border-b-2 p-2 border-black flex flex-col">
              <span>Address of Issuing Office : </span>
              <span>Name and Address of Agent : <span className='text-red-600 font-semibold'>{formData.companyName}</span></span>
            </div>
            <div className="flex items-center justify-center text-center p-16 text-3xl font-semibold text-red-600">{formData.city}</div>
          </div>
          <div className="border-b-2 border-black">
            <div className="border-b-2 border-black p-2">
              <p className="text-xs text-black">SERVICE TAX TO BE PAID BY</p>
            </div>
            <div className="grid grid-cols-3 text-[10px] h-[25px]">
              <div className="flex items-center justify-center border-r-2 border-black p-2 overflow-hidden">
                CONSIGNER
              </div>
              <div className="flex items-center justify-center border-r-2 border-black p-2 overflow-hidden">
                CONSIGNEE
              </div>
              <div className="flex items-center justify-center p-2 overflow-hidden">
                SIGNATORY
              </div>
            </div>
          </div>

          <div className="border-b-2 border-black text-xs flex flex-col gap-4 h-auto">
            <h3 className="text-black text-center">Service Tax Reg No.</h3>
            <div>
              <p className="mt-4 text-black p-1 ">GST No. {formData.gstNumber}</p>
              <p className=" text-black mb-2 p-1 ">PAN No. {formData.pan}</p>
            </div>

          </div>
          <div className=" text-black text-sm font-semibold flex flex-col justify-evenly gap-6 p-2">
            <span className="underline text-black">Private Mark</span>
            <div className="flex flex-col gap-2">
              <span>
                ST No :
              </span>
              <span>
                CST No :
              </span>
              <span>
                DO No. :
              </span>
              <span>
                INV No. : <span className='text-red-600'>{formData.invoiceNo}</span>
              </span>
            </div>
            <span>
              Date : <span className='text-red-600'>{new Date(formData.date).toLocaleDateString('en-IN')}</span>
            </span>
            <span>
              Lorry No. : <span className='text-red-600'>{formData.truckNo}</span>
            </span>
          </div>

        </div>
        <div className="text-sm p-2 pt-0 flex gap-6 justify-between w-full">
          <span className="text-black whitespace-nowrap">
            Value : <span className="text-red-600 font-semibold">{formData.value || "As Per Invoice"}</span>
          </span>
          <span className="text-black text-sm whitespace-nowrap flex gap-4">
            Signature of Transport Operator : {formData.signature ? <Image src={formData.signature} width={40} height={40} alt='user signature' /> : null}
          </span>

        </div>
      </div>

    </div>


  )
}

export function FMemo({ formData, payments }: { formData: FMDataType, payments: PaymentBook[] }) {
  const netBalance = Number(formData.totalFreight) - Number(formData.advance) - Number(formData.commision) - Number(formData.hamali) - Number(formData.cashAC) - Number(formData.extra) - Number(formData.TDS) - Number(formData.tire) - Number(formData.spareParts)
  return (
    <Card className="relative max-w-[800px] mx-auto font-sans text-sm shadow-md bg-white p-0">

      <div className='border border-black border-b-0 p-2'>
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-lg font-semibold uppercase text-center border-b-2 border-gray-500 pb-1">Challan / Freight Memo</h1>
          <div className="text-right text-xs">
            <p>📞 {formData.contactNumber}</p>
          </div>
        </div>

        <div className="text-center mb-5">
          <div className="flex items-center justify-center">
            {formData.logo ? <Image src={formData.logo} alt="Company Logo" width={80} height={80} /> : null}
            <div className="ml-4">
              <h2 className="text-3xl font-semibold text-gray-800"><CompanyHeader formData={formData} /></h2>
              <p className="text-lg font-normal uppercase text-gray-700">Fleet Owners and Transport Contractors</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formData.address}, {formData.city}, {formData.pincode}
          </p>
          <p className='text-sm text-gray-600 mt-2'>
            {formData.email && ` ✉️ ${formData.email}`}
          </p>
        </div>
      </div>


      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="border border-black p-2">Trailer No.: <strong>{formData.truckNo}</strong></td>
            <td className="border border-black p-2">Challan No.: <strong>{formData.challanNo}</strong></td>
            <td className="border border-black p-2">Date: <strong>{new Date(formData.date).toLocaleDateString('en-IN')}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Material: <strong>{formData.material.map((item, i) => item.name + (i === formData.material.length - 1 ? "" : ','))}</strong></td>
            <td className="border border-black p-2">From: <strong>{formData.from}</strong></td>
            <td className="border border-black p-2">To: <strong>{formData.to}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Vehicle Owner: <strong>{formData.vehicleOwner}</strong></td>
            <td className="border border-black p-2" colSpan={2}>PAN No.: <strong>{formData.pan}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">
              <strong>Dasti to Driver:</strong>
            </td>
            <td className="border border-black p-2">Rate</td>
            <td className="border border-black p-2"><strong>{formData.billingtype}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2 align-top" rowSpan={14}>
              <div className="whitespace-pre-wrap text-sm italic flex flex-col gap-4">{payments?.map((payment: any, index: number) => (
                <div key={payment._id} className='flex items-center justify-start gap-4 font-semibold text-gray-900'>
                  <p>{index + 1}. </p>
                  <p> {new Date(payment.date).toLocaleDateString('en-IN')} -</p>
                  <p> ₹{formatNumber(payment.amount)}/-</p>
                </div>
              ))}</div>
            </td>

          </tr>
          <tr>
            <td className="border border-black p-2">Weight</td>
            <td className="border border-black p-2"><strong>{formData.weight}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Total Freight</td>
            <td className="border border-black p-2"><strong>{formatNumber(formData.totalFreight)}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Advance</td>
            <td className="border border-black p-2"><strong>{formatNumber(formData.advance)}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Balance</td>
            <td className="border border-black p-2"><strong>{formatNumber(netBalance)}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Commission</td>
            <td className="border border-black p-2"><strong>{formatNumber(formData.commision)}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Hamali</td>
            <td className="border border-black p-2"><strong>{formatNumber(formData.hamali)}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Extra Weight</td>
            <td className="border border-black p-2"><strong>{formData.extraWeight}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Cash DASTI A/C</td>
            <td className="border border-black p-2"><strong>{formatNumber(formData.cashAC)}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Extra</td>
            <td className="border border-black p-2"><strong>{formData.extra}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">TDS</td>
            <td className="border border-black p-2"><strong>{formData.TDS}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Tyre</td>
            <td className="border border-black p-2"><strong>{formData.tire}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2">Spare Parts</td>
            <td className="border border-black p-2"><strong>{formData.spareParts}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-bold">Net Balance</td>
            <td className="border border-black p-2 font-bold"><strong>{formatNumber(netBalance)}</strong></td>
          </tr>
          <tr>
            <td className="border border-black p-2" colSpan={3}>
              <strong>LR Rec. Date: {new Date(formData.lrdate).toLocaleDateString('en-IN')}</strong>
              <p><strong>Payment Date:</strong></p>
            </td>
          </tr>
        </tbody>
      </table>

      <div className='border border-black border-t-0 p-2'>
        <div className="mt-4 text-sm">
          <strong>Conditions:</strong>
          <div className="flex justify-between items-center gap-8">
            <p>Vehicle owner is responsible for the safe and timely delivery of the consignment and would be fined in case of late delivery and damages.</p>
            <span className='whitespace-nowrap'>For {formData.companyName}</span>
          </div>
          <div className="text-right mt-6">
            {formData.signature && <div className="flex justify-end"><Image src={formData.signature} alt="signature" height={50} width={50} /></div>}
            <p>Cashier/Accountant</p>
          </div>
        </div>

        <div className="text-center text-xs mt-4 py-4">
          <p className="flex items-center justify-center">
            Powered by
            <Image src="https://www.awajahi.com/awajahi%20logo.png" alt="Awajahi logo" width={20} height={20} className="mx-1" />
            Awajahi
          </p>
        </div>
      </div>

    </Card>
  );

}