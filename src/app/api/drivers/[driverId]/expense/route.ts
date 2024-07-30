import { verifyToken } from "@/utils/auth"
import { connectToDatabase, ExpenseSchema } from "@/utils/schema"
import { model, models } from "mongoose"
import { NextResponse } from "next/server"

const Expense = models.Expense || model('Expense', ExpenseSchema)

export async function GET(req : Request, {params} : {params : {driverId : string}}){
    const {driverId} = params
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }

        await connectToDatabase()

        const driverExpenses = await Expense.find({user_id : user, driver : driverId}).lean()
        return NextResponse.json({driverExpenses, status : 200})
    }catch(error){
        return NextResponse.json({error, status : 500})
    }
}