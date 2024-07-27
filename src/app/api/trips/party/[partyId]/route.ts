import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, tripSchema, partySchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
const Party = mongoose.models.Party || mongoose.model('Party', partySchema);

export async function GET(request: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { partyId } = params;
    const trips = await Trip.find({ user_id: user, party: partyId })
      .select(['LR', 'startDate', 'truck', 'route', 'status', 'accounts', 'trip_id', 'amount'])
      .sort({ 'dates.0': -1 })  // Ensure sorting by the correct field
      .lean()
      .exec();

    return NextResponse.json({ trips });
  } catch (err) {
    console.error('Error fetching trips:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
