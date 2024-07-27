import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema)

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }
    try {
        const { truckNo } = params;
        await connectToDatabase();

        const trips = await Trip.find({ user_id: user, truck: truckNo }).lean().sort({ 'dates.0': -1 }).exec();
        return NextResponse.json({ trips });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}