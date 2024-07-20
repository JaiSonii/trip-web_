import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripSchema, TruckExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TruckExpense = models.TruckExpense || model('TruckExpense', TruckExpenseSchema)

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  // Connect to the database
  await connectToDatabase();

  // Extract the tripId from the request params
  const { tripId } = params;

  try {
    // Fetch the trip expenses from the database
    const charges = await TruckExpense.find({ user_id: user, trip: tripId });

    // Return a success response with the charges
    return NextResponse.json({ status: 200, charges });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching trip expenses:", error);
    return NextResponse.json({ status: 500, error: "Failed to fetch expenses" });
  }
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  // Connect to the database
  await connectToDatabase();

  // Extract the tripId from the request params
  const { tripId } = params;

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    // Parse the request body as JSON
    const data = await req.json();

    if (data.partyBill && data.expenseType == 'Fuel Expense') {
      return NextResponse.json({ status: 400, message: "Cannot Add Fuel to Party Bill" })
    }

    // Create a new instance of TripExpense with the parsed data and tripId
    const charge = new TruckExpense({
      ...data,
      trip: tripId,
      user_id: user
    });


    // Save the new charge to the database
    await charge.save();

    // Return a success response with the new charge
    return NextResponse.json({ status: 200, charge });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error creating new trip expense:", error);
    return NextResponse.json({ status: 500, error: "Failed to create new expense" });
  }
}


