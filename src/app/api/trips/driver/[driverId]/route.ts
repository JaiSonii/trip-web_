import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, tripSchema, partySchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

export async function GET(request: Request, { params }: { params: { driverId: string } }) {
  const { user, error } = await verifyToken(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { driverId } = params;
    console.log(driverId)
    const trips = await Trip.find({ user_id: user, driver: driverId })
      .select(['startDate', 'truck', 'route', 'status', 'trip_id', 'party'])
      .sort({ 'dates.0': -1 })  // Ensure sorting by the correct field
      .lean()
      .exec();

    return NextResponse.json({ trips });
  } catch (err) {
    console.error('Error fetching trips:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
