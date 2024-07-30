import { fetchBalanceBack } from "@/helpers/fetchTripBalance";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripChargesSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema);
const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema);

export async function GET(req: Request, { params }: { params: { partyId: string } }) {
  const { partyId } = params;
  
  try {
    const { user, error } = await verifyToken(req);
    if (!user || error) {
      return NextResponse.json({ error, status: 401 });
    }

    await connectToDatabase();
    const trips = await Trip.find({ user_id: user, party: partyId }).select(['amount', 'accounts', 'trip_id']);
    let totalbalance = 0;

    for (const trip of trips) {
      const charges = await TripCharges.find({ user_id: user, trip_id: trip.trip_id });
      totalbalance += await fetchBalanceBack(trip, charges);
    }

    return NextResponse.json({ totalbalance });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}
