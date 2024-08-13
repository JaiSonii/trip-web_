import { verifyToken } from "@/utils/auth";
import { connectToDatabase, OfficeExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const OfficeExpense = models.OfficeExpense || model('OfficeExpense', OfficeExpenseSchema)

export async function GET(req : Request){
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }
        await connectToDatabase()
        const expenses = await OfficeExpense.find({user_id : user}).lean()
        return NextResponse.json({expenses, status :200})
    }catch(error: any){
        console.error(error)
        return NextResponse.json({status : 500, error})
    }
}

export async function POST(req : Request){
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }
        await connectToDatabase()
        const data = await req.json()
        const expense = new OfficeExpense({...data, user_id : user})
        await expense.save()
        return NextResponse.json({expense, status :200})
    }catch(error: any){
        console.error(error)
        return NextResponse.json({status : 500, error})
    }
}