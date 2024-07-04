import { ITrip } from "@/utils/interface";
import { connectToDatabase } from "@/utils/schema";
import { tripSchema } from "@/utils/schema";
import {models, model} from 'mongoose'
import { NextResponse } from "next/server";


const Trip = models.Trip || model('Trip', tripSchema)

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
    const { tripId } = params;
  
    try {
      await connectToDatabase();
  
      const trip = await Trip.findOne({ tripId }).exec();
  
      if (!trip) {
        return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
      }
  
      return NextResponse.json({ trip }, { status: 200 });
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
    }
  }

export async function PATCH(req : Request, {params} : {params :{ tripId : string} }) {
  try {
    const { tripId } = params;
    const {data} = await req.json();
    console.log(data)
    const {amount, POD, status , dates} = data

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const trip = await Trip.findOne({ tripId: tripId });
    
    if (!trip) {
      return NextResponse.json({ message: 'No Driver Found' }, { status: 404 });
    }
    if (status && dates){
      trip.status = status
      trip.dates = dates
    }
    if (amount){
      trip.balance = 0
    }
    trip.POD = POD || ""

    await trip.save()
    return NextResponse.json({ trip: trip }, { status: 200 });
  } catch (err: any) {
    console.log(err)
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}