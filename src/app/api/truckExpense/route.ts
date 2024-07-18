import { useAuth } from "@/components/AuthProvider";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, TruckExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TruckExpense = models.TruckExpense || model('TruckExpense', TruckExpenseSchema)

export async function GET(req: Request) {
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }

    try{
        await connectToDatabase()
        const truckExpense = await TruckExpense.find({user_id : user})
        return NextResponse.json({ truckExpense , status : 200})
    }catch(err : any){
        console.log(error)
        return NextResponse.json({message : err.message, status : 500})
    }
}