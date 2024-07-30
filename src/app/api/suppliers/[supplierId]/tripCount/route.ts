import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema)

export async function GET(req : Request, {params} : {params : {supplierId : string}}){
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }

        const {supplierId} = params
        await connectToDatabase()

        const tripCount = await Trip.countDocuments({user_id : user, supplier : supplierId})

        return NextResponse.json({tripCount, status : 200})
        
    } catch (error) {
        return NextResponse.json({error, status : 500})
    }
}