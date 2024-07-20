import { NextResponse } from 'next/server';// Ensure to import Request from 'express' or another appropriate package
import { connectToDatabase, tripSchema, truckSchema } from '@/utils/schema';
import { TruckModel } from '@/utils/interface';
import mongoose, { model, Model, models } from 'mongoose';
import { verifyToken } from '@/utils/auth';

const Truck = mongoose.models.Truck || mongoose.model<TruckModel>('Truck', truckSchema);
const Trip = models.Trip || model('Trip', tripSchema)

export async function PATCH(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { truckNo } = params;
    const { status } = await req.json(); // Assuming 'status' is in the body of the PATCH request

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const truck = await Truck.findOne({user_id : user, truckNo: truckNo });

    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    if (status) truck.status = status;

    await truck.save();

    return NextResponse.json({ truck: truck }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    const { truckNo } = params;
    const data = await req.json();

    await connectToDatabase();

    const truck = await Truck.findOneAndUpdate({ user_id: user, truckNo }, data, { new: true });

    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    const trips = await Trip.find({ user_id: user, truck : truckNo });

    await Promise.all(trips.map(async (trip) => {
      trip.truck = data.truckNo; // Update the truck number in each trip
      await trip.save();
    }));

    return NextResponse.json({ truck }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { truckNo } = params;// Assuming 'status' is in the body of the PATCH request

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const truck = await Truck.findOne({user_id : user, truckNo: truckNo });

    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    return NextResponse.json({ truck: truck }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { truckNo } = params;// Assuming 'status' is in the body of the PATCH request

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const foundTruck = await Truck.findOne({user_id : user, truckNo: truckNo });
    if(foundTruck.status == 'On Trip'){
      return NextResponse.json({message : "Truck currently on Trip", status : 400})
    }

    const truck = await Truck.findOneAndDelete({user_id : user, truckNo: truckNo });

    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    return NextResponse.json({ truck: truck }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}