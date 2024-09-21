import { NextResponse } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { driverSchema, supplierSchema, tripSchema, truckSchema } from '@/utils/schema';
import { connectToDatabase } from '@/utils/schema';
import { ITrip } from '@/utils/interface';
import { v4 as uuidv4 } from 'uuid'
import { partySchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { uploadFileToS3 } from '@/helpers/fileOperation';

const Trip = models.Trip || model('Trip', tripSchema);
const Party = models.Party || model('Party', partySchema)
const Supplier = models.Supplier || model('Supplier', supplierSchema)
const Driver = models.Driver || model('Driver', driverSchema)
const Truck = models.Truck || model('Truck', truckSchema)
// Assuming you have this schema defined

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const statuses = url.searchParams.get('statuses')?.split(',').map(Number);

    // Prepare query with user_id and optional statuses filter
    const query: any = { user_id: user };
    if (statuses && statuses.length > 0) {
      query.status = { $in: statuses };
    }

    // Use an aggregation pipeline to fetch the required data, calculate balance, and join with Party collection
    const trips = await Trip.aggregate([
      { $match: query },  // Filter trips based on user_id and optional statuses
      {
        $lookup: {
          from: 'parties',  // Join with the Party collection
          localField: 'party',
          foreignField: 'party_id',
          as: 'partyDetails'
        }
      },
      { $unwind: '$partyDetails' },  // Unwind partyDetails array
      {
        $lookup: {
          from: 'tripcharges',  // Join with the TripExpense collection
          localField: 'trip_id',
          foreignField: 'trip_id',
          as: 'tripExpenses'
        }
      },
      {
        $addFields: {
          // Calculate the final balance based on the fetchBalance logic
          balance: {
            $let: {
              vars: {
                accountBalance: {
                  $sum: {
                    $map: {
                      input: '$accounts',
                      as: 'account',
                      in: '$$account.amount'
                    }
                  }
                },
                chargeToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripExpenses',
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
                          input: '$tripExpenses',
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
                  { $add: ['$amount', '$$chargeToBill'] },  // Add trip amount and chargeToBill
                  { $add: ['$$accountBalance', '$$chargeNotToBill'] }  // Subtract accountBalance and chargeNotToBill
                ]
              }
            }
          },
          // Include the party name from the joined partyDetails
          partyName: '$partyDetails.name'
        }
      },
      { $sort: { startDate: -1 } },  // Sort by startDate in descending order
      // Exclude unnecessary fields including accountBalance, chargeToBill, and chargeNotToBill
      { $project: { partyDetails: 0, tripExpenses: 0, accounts: 0, chargeToBill: 0, chargeNotToBill: 0, accountBalance: 0 } }
    ]);

    return NextResponse.json({ trips });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}





export async function POST(this: any, req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  try {
    await connectToDatabase(); // Establish database connection

    const formData = await req.formData();
    const tripId = 'trip' + uuidv4();

    // Handle file upload if a file is provided
    const file = formData.get('file') as File | null;
    let fileUrl = '';

    if (file) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `trips/ewaybill-${tripId}`;
      const contentType = file.type;
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;
    }

    const validity = formData.get('ewbValidity')

    // Prepare trip data
    const newTrip: ITrip = new Trip({
      user_id: user,
      trip_id: tripId,
      party: formData.get('party'),
      truck: formData.get('truck'),
      driver: formData.get('driver'),
      supplier: formData.get('supplierId'),
      route: {
        origin: formData.get('origin'),
        destination: formData.get('destination'),
      },
      billingType: formData.get('billingType'),
      amount: parseFloat(formData.get('amount') as string),
      balance: parseFloat(formData.get('amount') as string),
      dates: [new Date(formData.get('startDate') as string), null, null, null, null],
      truckHireCost: parseFloat(formData.get('truckHireCost') as string) || 0,
      LR: formData.get('LR'),
      status: 0,
      material: formData.get('material') || '',
      notes: formData.get('notes') || '',
      accounts: [],
      documents: []
    });

    if (validity !== null) {
      newTrip.ewbValidityDate = new Date(validity as string)
      newTrip.documents.push({
        filename: file?.name || '',
        type: "E-Way Bill",
        validityDate: new Date(validity as any),
        uploadedDate: new Date(),
        url: fileUrl,
      })
    }

    // Save the new trip document
    const savedTrip = await newTrip.save();

    // Update related records
    await Driver.findOneAndUpdate({ user_id: user, driver_id: formData.get('driver') }, { status: 'On Trip' });
    await Truck.findOneAndUpdate({ user_id: user, truckNo: formData.get('truck') }, { status: 'On Trip' });

    // Return success response
    return NextResponse.json({ message: 'Saved Successfully', data: savedTrip }, { status: 200 });

  } catch (error: any) {
    console.error('Error saving trip:', error);

    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error.name === 'ValidationError') {
      errorMessage = 'Validation Error';
      statusCode = 400;
    } else if (error.name === 'MongoError' && error.code === 11000) {
      errorMessage = 'Duplicate Key Error';
      statusCode = 409;
    }

    return NextResponse.json({ message: errorMessage, details: error.message }, { status: statusCode });
  }
}

