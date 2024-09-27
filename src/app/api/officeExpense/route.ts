import { verifyToken } from "@/utils/auth";
import { connectToDatabase, OfficeExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const OfficeExpense = models.OfficeExpense || model('OfficeExpense', OfficeExpenseSchema)

export async function GET(req: Request) {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
  
    const url = new URL(req.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
  
    if (!month || !year) {
      await connectToDatabase();
      const expenses = await OfficeExpense.find({ user_id: user }).sort({date : -1}).lean();
      return NextResponse.json({ expenses, status: 200 });
    }
  
    // Map of month names to month numbers (0-indexed)
    const monthMap: { [key: string]: number } = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11
    };
  
    const monthNumber = monthMap[month];
    if (monthNumber === undefined) {
      return NextResponse.json({ error: 'Invalid month name', status: 400 });
    }
  
    const startDate = new Date(year as any, monthNumber, 1);
    console.log('Start Date : ' + startDate)
    const endDate = new Date(year as any, monthNumber + 1, 1); // Next month's start date
    console.log('End Date : ' + endDate)
  
    try {
      await connectToDatabase();
      const expenses = await OfficeExpense.find({
        user_id: user,
        date: {
          $gte: startDate,
          $lt: endDate,
        }
      }).lean();
  
      return NextResponse.json({ expenses : expenses, status: 200 });
    } catch (err: any) {
      console.log(err);
      return NextResponse.json({ message: err.message, status: 500 });
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