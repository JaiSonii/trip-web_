import { useAuth } from "@/components/AuthProvider";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Expense = models.Expense || model('Expense', ExpenseSchema)


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
    const expenses = await Expense.find({ user_id: user });
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
    const expenses = await Expense.find({
      user_id: user,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      $or: [
        { trip_id: { $exists: false } },
        { trip_id: { $eq: '' } }
      ]
    }).lean();

    return NextResponse.json({ truckExpense : expenses, status: 200 });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ message: err.message, status: 500 });
  }
}


export async function POST(req: Request) {
  // Connect to the database
  await connectToDatabase();

  // Extract the tripId from the request params

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    // Parse the request body as JSON
    const data = await req.json();
    console.log(data)

    // Create a new instance of TripExpense with the parsed data and tripId
    const newCharge = new Expense({
      ...data,
      user_id: user
    });


    // Save the new charge to the database
    await newCharge.save();

    // Return a success response with the new charge
    return NextResponse.json({ status: 200, newCharge });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error creating new trip expense:", error);
    return NextResponse.json({ status: 500, error: "Failed to create new expense" });
  }
}