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
    const trips = await Trip.aggregate([
      {
        $match: {
          user_id: user,
          driver : driverId
        }
      }, // Filter trips based on user_id and partyId
      {
        $lookup: {
          from: 'parties', // Join with the Party collection
          localField: 'party',
          foreignField: 'party_id',
          as: 'partyDetails'
        }
      },
      { $unwind: '$partyDetails' }, // Unwind partyDetails array
      {
        $addFields: {
          // Include the party name from the joined partyDetails
          partyName: '$partyDetails.name'
        }
      },
      {
        $sort: { startDate: -1 } // Sort by startDate in descending order
      },
      {
        $project: {
          trip_id: 1,
          startDate: 1,
          truck: 1,
          route: 1,
          truckHireCost: 1,
          status: 1, // Include the calculated balance
          partyName: 1,
          LR: 1 // Include the party name
        }
      }
    ]);
    

    return NextResponse.json({ trips });
  } catch (err) {
    console.error('Error fetching trips:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
