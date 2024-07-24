
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TripExpense = models.TripExpense || model('TripExpense', tripExpenseSchema)

export async function GET(req: Request) {
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }
  
    const url = new URL(req.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    console.log(`${month} ${year}`);
  
    if (!month || !year) {
        await connectToDatabase();
        const tripExpense = await TripExpense.find({ user_id: user });
        return NextResponse.json({ tripExpense, status: 200 });
    }
  
    // Map of month names to month numbers (0-indexed)
    const monthMap : { [key: string]: number } = {
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
        const truckExpense = await TripExpense.find({
            user_id: user,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).lean();
        return NextResponse.json({ truckExpense, status: 200 });
    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ message: err.message, status: 500 });
    }
  }