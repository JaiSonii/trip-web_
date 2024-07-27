import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema);

export async function GET(req: Request, { params }: { params: { driverId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  try {
    const { driverId } = params;
    await connectToDatabase();

    const accounts = await Trip.aggregate([
      { $match: { user_id: user, driver: driverId } },
      { $unwind: "$accounts" },
      { $sort: { "dates.0": -1 } },
      { $project: { 
          _id: 0, 
          account: "$accounts",
          tripId: "$trip_id" 
      }},
      { $replaceRoot: { newRoot: { $mergeObjects: ["$account", { tripId: "$tripId" }] } } },
      { $match: { receivedByDriver: true } } // Optional: filter accounts received by driver
    ]);

    return NextResponse.json({ accounts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
