import { verifyToken } from "@/utils/auth";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const User = models.User || model('User', userSchema)

export async function GET(req : Request){
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }
        await connectToDatabase()
        const accesibleAccounts = await User.findOne({user_id : user}).select('accessGiven').lean()
        return NextResponse.json({accounts : accesibleAccounts, status : 200})
    } catch (error) {
        return NextResponse.json({error, status : 500})
    }
}