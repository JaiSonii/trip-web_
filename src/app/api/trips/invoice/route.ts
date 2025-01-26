
import { uploadFileToS3 } from "@/helpers/fileOperation";
import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { invData } from "@/utils/interface";
import { connectToDatabase, InvoiceSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema)
const Invoice = models.Invoice || model('Invoice', InvoiceSchema)


export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  const url = new URL(req.url)
  const reqTrips = JSON.parse(url.searchParams.get('trips') as string)
  console.log(reqTrips)

  try {
    await connectToDatabase();

    const trips = await Trip.aggregate([
      {
        $match: {
          user_id: user,
          trip_id: { $in: reqTrips }
        }
      },
      {
        $lookup: {
          from: 'parties',
          let: { party_id: '$party' },
          pipeline: [
            { $match: { $expr: { $eq: ['$party_id', '$$party_id'] } } },
            { $project: { name: 1 } }  // Project only the fields needed
          ],
          as: 'partyDetails'
        }
      },
      { $unwind: '$partyDetails' },  // Unwind after filtered `$lookup`
      {
        $lookup: {
          from: 'suppliers',
          let: { supplier_id: '$supplier' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$supplier_id', '$$supplier_id'] },
                    { $ne: ['$supplier_id', null] },  // Exclude null supplier IDs
                    { $ne: ['$supplier_id', ''] }     // Exclude empty string supplier IDs
                  ]
                }
              }
            },
            { $project: { name: 1 } }
          ],
          as: 'supplierDetails'
        }
      },
      {
        $addFields: {
          supplierName: { $arrayElemAt: ['$supplierDetails.name', 0] }  // Extract supplier name
        }
      },
      {
        $lookup: {
          from: 'drivers',
          let: { driver_id: '$driver' },
          pipeline: [
            { $match: { $expr: { $eq: ['$driver_id', '$$driver_id'] } } },
            { $project: { name: 1 } }
          ],
          as: 'driverDetails'
        }
      },
      { $unwind: '$driverDetails' },  // Unwind after filtered `$lookup`
      {
        $lookup: {
          from: 'expenses',
          let: { trip_id: '$trip_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$trip_id', '$$trip_id'] } } },
          ],
          as: 'tripExpenses'
        }
      },
      {
        $lookup: {
          from: 'tripcharges',
          let: { trip_id: '$trip_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$trip_id', '$$trip_id'] } } },
          ],
          as: 'tripCharges'
        }
      },
      {
        $lookup: {
          from: 'partypayments',
          let: { trip_id: '$trip_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$trip_id', '$$trip_id'] } } },
          ],
          as: 'tripAccounts'
        }
      },
      {
        $addFields: {
          balance: {
            $let: {
              vars: {
                accountBalance: { $sum: '$tripAccounts.amount' },
                chargeToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripCharges',
                          as: 'expense',
                          cond: { $eq: ['$$expense.partyBill', true] }
                        }
                      },
                      as: 'filteredExpense',
                      in: '$$filteredExpense.amount'
                    }
                  }
                },
                chargeNotToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripCharges',
                          as: 'expense',
                          cond: { $eq: ['$$expense.partyBill', false] }
                        }
                      },
                      as: 'filteredExpense',
                      in: '$$filteredExpense.amount'
                    }
                  }
                }
              },
              in: {
                $subtract: [
                  { $add: ['$amount', '$$chargeToBill'] },
                  { $add: ['$$accountBalance', '$$chargeNotToBill'] }
                ]
              }
            }
          },
          partyName: '$partyDetails.name',
          driverName: '$driverDetails.name'
        }
      },
      {
        $sort: { startDate: -1 }
      },
      {
        $project: {
          supplierDetails: 0,
          driverDetails: 0,
        }
      }
    ]);



    if (!trips) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trips: trips }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verify user token
    const { user, error } = await verifyToken(req);
    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized User', status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Get form data
    const formdata = await req.formData();
    const file = formdata.get('file') as File;
    const data = JSON.parse(formdata.get('data') as string) as invData



    // Prepare file for upload to S3
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `invoices/${user}-${data?.invoiceNo}`;
    const contentType = file.type;

    // Upload file to S3
    const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;

    // Check if the document type already exists in the documents array

    const invoices = await Invoice.find({user_id : user})

    const newInvoice = new Invoice({
      user_id : user,
      url : fileUrl,
      invoiceNo : invoices.length + 1,
      date : new Date(data?.date),
      dueDate : new Date(data?.dueDate),
      party_id : data.party_id,
      trips : data?.trips,
      balance : data.balance,
      invoiceStatus : data?.invoiceStatus,
      total : data?.total,
      advance : data?.advance
    })
  

    // Save the updated trip document
    await Promise.all([newInvoice.save(), recentActivity('Generated Invoice',newInvoice, user)]);

    // Return success response
    return NextResponse.json({ message: 'Document uploaded successfully', status: 200 });

  } catch (error) {
    // Log the error and return server error response
    console.error("Error in uploading document:", error);
    return NextResponse.json({ error: 'Failed to upload document', status: 500 });
  }
}