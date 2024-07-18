import { verifyToken } from "@/utils/auth";
import { connectToDatabase, TruckExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TruckExpense = models.TruckExpense || model('TruckExpense', TruckExpenseSchema);

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
    const { truckNo } = params;
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }
    await connectToDatabase()
    try {
        const expenses = await TruckExpense.find({ user_id: user, truck: truckNo }).sort({ date: -1 });
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
      const newCharge = new TruckExpense({
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