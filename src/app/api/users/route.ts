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
        const userData = await User.findOne({user_id : user})
        if(!userData){
            return NextResponse.json({error : 'User Not Found', status : 400})
        }
        return NextResponse.json({status : 200, user : userData})
    } catch (error) {
        console.log(error)
        return NextResponse.json({status : 500, error : error})
    }
}



export async function PUT(req : Request) {
    try {
        const {user,error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }
        const data = await req.json()
        await connectToDatabase()
        const updatedUser = await User.findOneAndUpdate({user_id : user}, data, {new : true})
        if(!updatedUser){
            return NextResponse.json({error : 'User not found', status : 400})
        }
        return NextResponse.json({status : 200, updatedUser})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error, status : 500})
    }
}