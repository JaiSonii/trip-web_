import { NextResponse } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { driverSchema, supplierSchema, tripSchema, truckSchema } from '@/utils/schema';
import { connectToDatabase } from '@/utils/schema';
import { ITrip } from '@/utils/interface';
import {v4 as uuidv4} from 'uuid'
import { partySchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { uploadFileToS3 } from '@/helpers/S3Operation';

const Trip = models.Trip || model('Trip', tripSchema);
const Party = models.Party || model('Party', partySchema)
const Supplier = models.Supplier || model('Supplier', supplierSchema)
const Driver = models.Driver || model('Driver', driverSchema)
const Truck = models.Truck || model('Truck', truckSchema)


export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const statuses = url.searchParams.get('statuses')?.split(',').map(Number);

    const query: any = { user_id: user };

    // If statuses are provided, use the $in operator to match any of the statuses
    if (statuses && statuses.length > 0) {
      query.status = { $in: statuses };
    }

    const trips = await Trip.find(query).lean().sort({ 'dates.0': -1 }).exec();

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
    });

    if(validity !== null){
      newTrip.ewbValidityDate = new Date(validity as string)
      newTrip.documents.push({
        filename: file?.name || '',
        type: "ewayBill",
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

