import { useAuth } from "@/components/AuthProvider";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, TruckExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TruckExpense = models.TruckExpense || model('TruckExpense', TruckExpenseSchema)

export async function GET(req: Request) {
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }

    try{
        await connectToDatabase()
        const truckExpense = await TruckExpense.find({user_id : user})
        return NextResponse.json({ truckExpense , status : 200})
    }catch(err : any){
        console.log(error)
        return NextResponse.json({message : err.message, status : 500})
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
      return NextResponse.json({ status: 500, error: "Failed to create new expense" });
    }
  }