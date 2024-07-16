import { verifyToken } from "@/utils/auth";
import { TruckExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TruckExpense = models.TruckExpense || model('TruckExpense', TruckExpenseSchema)

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
    const { truckNo } = params;
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }
    try {
        const expenses = await TruckExpense.find({ user_id: user, truck: truckNo })
        return NextResponse.json(expenses)
    } catch (error : any) {
        console.log(error)
        return NextResponse.json({message : error.message, status : 500})
    }

}