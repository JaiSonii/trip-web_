import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { maintenanceChargeTypes } from "@/utils/utilArray";
import { model, models } from "mongoose";

const Expense = models.Expense || model('Expense', ExpenseSchema)

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
  const { truckNo } = params;
  const url = new URL(req.url);
  const expenseType = url.searchParams.get('type');
  const { user, error } = await verifyToken(req);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  await connectToDatabase();

  try {
    let filter : any= { user_id: user, truck: truckNo };
    
    if (expenseType === 'fuel') {
      filter = { ...filter, expenseType: 'Fuel Expense' };
    } else if (expenseType === 'maintenance') {
      filter = { ...filter, expenseType: { $in: Array.from(maintenanceChargeTypes) } };
    } else if (expenseType === 'other') {
      filter = { ...filter, expenseType: { $nin: Array.from(maintenanceChargeTypes) } };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message, status: 500 });
  }
}


export async function POST(req: Request, { params }: { params: { truckNo: string } }) {
    // Connect to the database
    await connectToDatabase();
  
    // Extract the tripId from the request params
    const { truckNo } = params;
  
    try {
      const { user, error } = await verifyToken(req);
      if (error) {
        return NextResponse.json({ error });
      }
      // Parse the request body as JSON
      const data = await req.json();
  
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
      return NextResponse.json({ status: 500, error: "Failed to create new trip expense" });
    }
  }