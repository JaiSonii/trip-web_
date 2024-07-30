import { verifyToken } from "@/utils/auth";
import { connectToDatabase, supplierAccountSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema);
const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema);

export async function GET(req: Request, { params }: { params: { supplierId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { supplierId } = params;
        await connectToDatabase();

        const [supplierAccountSummary, tripSummary] = await Promise.all([
            SupplierAccount.aggregate([
                { $match: { user_id: user, supplier_id: supplierId } },
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]),
            Trip.aggregate([
                { $match: { user_id: user, supplier: supplierId } },
                { $group: { _id: null, totalTruckHireCost: { $sum: "$truckHireCost" } } }
            ])
        ]);

        const totalAccountBalance = supplierAccountSummary[0]?.totalAmount || 0;
        const totalTruckHireCost = tripSummary[0]?.totalTruckHireCost || 0;
        const balance = totalAccountBalance - totalTruckHireCost;

        return NextResponse.json({ balance, status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
