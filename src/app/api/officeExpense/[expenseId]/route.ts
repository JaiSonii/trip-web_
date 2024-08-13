import { verifyToken } from "@/utils/auth";
import { connectToDatabase, OfficeExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const OfficeExpense = models.OfficeExpense || model('OfficeExpense', OfficeExpenseSchema)

export async function PUT(req : Request, {params} : {params : {expenseId : string}}){
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }
        await connectToDatabase()
        const {expenseId} = params
        const data = await req.json()
        const expense = await OfficeExpense.findOneAndUpdate({user_id : user, _id : expenseId}, data, {new: true}).lean()
        return NextResponse.json({expense, status :200})
    }catch(error: any){
        console.error(error)
        return NextResponse.json({status : 500, error})
    }
}

export async function DELETE(req : Request, {params} : {params : {expenseId : string}}){
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }
        await connectToDatabase()
        const {expenseId} = params
        const expense = await OfficeExpense.findOneAndDelete({user_id : user, _id : expenseId}).lean()
        return NextResponse.json({expense, status :200})
    }catch(error: any){
        console.error(error)
        return NextResponse.json({status : 500, error})
    }
}