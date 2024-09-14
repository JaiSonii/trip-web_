import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema, tripSchema, truckSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

// Initialize models if they don't exist
const Trip = models.Trip || model('Trip', tripSchema);
const Driver = models.Driver || model('Driver', driverSchema);
const Truck = models.Truck || model('Truck', truckSchema);

export async function GET(req: Request) {
    try {
        // Verify the user
        const { user, error } = await verifyToken(req);
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        // Connect to the database
        await connectToDatabase();

        // Query for documents across trips, drivers, and trucks
        const [trips, drivers, trucks] = await Promise.all([
            Trip.find({ user_id: user }).select('documents'),
            Driver.find({ user_id: user }).select('documents'),
            Truck.find({ user_id: user }).select('documents'),
        ]);


        // Merge all documents into a single array and sort by validityDate in descending order (latest first)
        const allDocuments = [...trips, ...drivers, ...trucks]
            .reduce((acc, item) => acc.concat(item.documents), [])
            .sort((a: any, b: any) => new Date(b.validityDate).getTime() - new Date(a.validityDate).getTime())
            .slice(0, 5); // Get the latest 5 documents

        // Return the latest five documents
        return NextResponse.json({
            documents: allDocuments,
            status: 200
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
}
