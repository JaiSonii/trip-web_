import DriverModal from "@/components/driver/driverModal";
import { fetchBalance, fetchBalanceBack } from "@/helpers/fetchTripBalance";
import { uploadFileToS3 } from "@/helpers/S3Operation";
import { verifyToken } from "@/utils/auth";
import { ITrip, PaymentBook } from "@/utils/interface";
import { connectToDatabase, driverSchema, ExpenseSchema, partySchema, supplierAccountSchema, tripChargesSchema, truckSchema } from "@/utils/schema";
import { tripSchema } from "@/utils/schema";
import { models, model } from 'mongoose'
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";


const Trip = models.Trip || model('Trip', tripSchema)
const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema)
const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema)
const Expense = models.Expense || model('Expense', ExpenseSchema)

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { tripId } = params;

  try {
    await connectToDatabase();

    const trip = await Trip.findOne({ user_id: user, trip_id: tripId }).lean().exec();

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { tripId } = params;
    const { data } = await req.json();
    const { amount, podImage, status, dates, account, notes } = data;
    await connectToDatabase();

    const trip = await Trip.findOne({ user_id: user, trip_id: tripId });

    if (!trip) {
      return NextResponse.json({ message: 'No Trip Found' }, { status: 404 });
    }

    if (notes) {
      trip.notes = notes
    }

    if (account) {
      if (account.paymentBook_id) {
        trip.accounts = trip.accounts.filter((acc: PaymentBook) => acc.paymentBook_id = account.paymentBook_id)
        trip.accounts.push(account)
      }
      else {
        account.paymentBook_id = 'payment' + uuidv4()
        trip.accounts.push(account);
      }
      const TripExpense = models.TripExpense || model('TripExpense', tripChargesSchema)
      const charges = await TripExpense.find({ user_id: user, trip_id: trip.trip_id })
      const pending = await fetchBalanceBack(trip, charges)
      if (pending < 0) {
        return NextResponse.json({ message: "Balance going negative", status: 400 })
      }

    }

    if (status && dates) {
      trip.status = status;
    
      if (status === 2 && podImage) {
        // Extract the MIME type and remove the Base64 prefix
        const base64String = podImage;
        const contentType = base64String.match(/^data:(.+);base64,/)[1];
        const base64Data = base64String.replace(/^data:.+;base64,/, '');
    
        // Convert the Base64 string to a Buffer
        const fileBuffer = Buffer.from(base64Data, 'base64');
    
        // Define the S3 file name
        const fileName = `trips/pod-${trip.trip_id}`;
    
        // Upload the file to S3
        const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType==='application/pdf' ? '.pdf' : ''}`
        trip.POD = fileUrl
      }
    
      trip.dates = dates;
    }
    

    await trip.save();
    return NextResponse.json({ trip: trip }, { status: 200 });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { tripId } = params;

  try {
    await connectToDatabase();

    // Assuming data is correctly parsed from req.json()
    const { data } = await req.json();

    // Assuming models.Truck and models.Driver are defined elsewhere
    const Truck = models.Truck || model('Truck', truckSchema);
    const Driver = models.Driver || model('Driver', driverSchema);

    const oldTrip = await Trip.findOne({ user_id: user, trip_id: tripId })
    const TripExpense = models.TripExpense || model('TripExpense', tripChargesSchema)
    const charges = await TripExpense.find({ user_id: user, trip_id: oldTrip.trip_id })
    const pending = await fetchBalanceBack(oldTrip,charges)
    if (pending < 0) {
      return NextResponse.json({ message: "Balance going negative", status: 400 })
    }

    const trip = await Trip.findOneAndUpdate({ user_id: user, trip_id: tripId }, data, { new: true });

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }



    // Update driver status to 'On Trip'

    await Driver.findOneAndUpdate({ driver_id: trip.driver }, { status: 'On Trip' });

    // Update truck status to 'On Trip'

    await Truck.findOneAndUpdate({ truckNo: trip.truck }, { status: 'On Trip' });

    // Return updated trip with status 200
    return NextResponse.json({ trip }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { tripId } = params;
  const Truck = models.Truck || model('Truck', truckSchema);
  const Driver = models.Driver || model('Driver', driverSchema);

  try {
    await connectToDatabase();

    const trip = await Trip.findOneAndDelete({ user_id: user, trip_id: tripId }).exec();

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    await Truck.findOneAndUpdate({user_id : user, truckNo: trip.truck }, { status: 'Available' })
    await Driver.findOneAndUpdate({ user_id : user, driver_id: trip.driver }, { status: 'Available' })
    await TripCharges.deleteMany({user_id : user, trip_id : tripId})
    await Expense.deleteMany({user_id : user, trip_id : tripId})
    await SupplierAccount.deleteMany({user_id : user, trip_id : tripId})

    return NextResponse.json({ trip }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}