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

        // Use Promise.all for parallel queries and MongoDB aggregation to optimize the process
        const [tripResults, driverResults, truckResults] = await Promise.all([
            Trip.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: 1 } },
                { $unwind: '$documents' },
                { $sort: { 'documents.uploadedDate': -1 } }, // Sort documents by uploadedDate
                { $limit: 5 } // Limit to the latest 5 documents
            ]),
            Driver.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: 1 } },
                { $unwind: '$documents' },
                { $sort: { 'documents.uploadedDate': -1 } },
                { $limit: 5 }
            ]),
            Truck.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: 1 } },
                { $unwind: '$documents' },
                { $sort: { 'documents.uploadedDate': -1 } },
                { $limit: 5 }
            ])
        ]);

        // Combine and get the latest 5 documents across all collections
        const allDocuments = [...tripResults, ...driverResults, ...truckResults]
            .sort((a, b) => new Date(b.documents.uploadedDate).getTime() - new Date(a.documents.uploadedDate).getTime())
            .slice(0, 5); // Get latest 5 documents across all collections

        // Count documents for trips, drivers, and trucks
        const [tripDocumentsCount, driverDocumentsCount, truckDocumentsCount] = await Promise.all([
            Trip.countDocuments({ user_id: user }),
            Driver.countDocuments({ user_id: user }),
            Truck.countDocuments({ user_id: user }),
        ]);

        // Return the latest 5 documents along with document counts
        return NextResponse.json({
            documents: allDocuments.map(doc => doc.documents),
            counts: {
                tripDocuments: tripDocumentsCount,
                driverDocuments: driverDocumentsCount,
                truckDocuments: truckDocumentsCount,
            },
            status: 200
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
}

