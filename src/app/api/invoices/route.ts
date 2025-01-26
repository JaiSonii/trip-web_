import { verifyToken } from "@/utils/auth";
import { InvoiceSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { models, model } from "mongoose";

const Invoice = models.Invoice || model("Invoice", InvoiceSchema);

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
        }

        const debugPipeline = [
            { $match: { user_id: user } },
            {
                $lookup: {
                    from: "parties",
                    localField: "party_id",
                    foreignField: "party_id",
                    as: "partyDetails",
                },
            },
            { $unwind: { path: "$partyDetails", preserveNullAndEmptyArrays: true } }, // Ensure null values are preserved for debugging
            {
                $addFields: {
                    partyName: "$partyDetails.name",
                },
            },
            {
                $project: {
                    partyDetails: 0,
                },
            },
        ];

        const invoices = await Invoice.aggregate(debugPipeline);

        return NextResponse.json({invoices}, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
