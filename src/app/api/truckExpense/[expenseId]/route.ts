import { verifyToken } from "@/utils/auth";
import { connectToDatabase, TruckExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TruckExpense = models.TruckExpense || model('TruckExpense', TruckExpenseSchema)

export async function PATCH(req: Request, { params }: { params: { expenseId: string } }) {
  // Connect to the database
  await connectToDatabase();
  const { expenseId } = params

  // Extract the tripId from the request params

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    // Parse the request body as JSON
    let data = await req.json();
    console.log(data)

    if (data.partyBill && data.expenseType == 'Fuel Expense') {
      return NextResponse.json({ status: 400, message: "Cannot Add Fuel to Party Bill" })
    }

    // Create a new instance of TripExpense with the parsed data and tripId
    const newCharge = TruckExpense.findById(expenseId)
    if (!newCharge) {
      return NextResponse.json({ status: 404, message: "Charge Not Found" })
    }


    

    // Return a success response with the new charge
    return NextResponse.json({ status: 200, newCharge });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error creating new trip expense:", error);
    return NextResponse.json({ status: 500, error: "Failed to edit expense" });
  }
}

export async function DELETE(req: Request, { params }: { params: { expenseId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  const {expenseId} = params

  await connectToDatabase()
  try{
    const charge = await TruckExpense.findByIdAndDelete(expenseId)
    if(!charge){
      return NextResponse.json({ status: 404, message: "Charge Not Found" })
    }
    return NextResponse.json({message : 'Deletion Success', status : 2000})
  }catch(error){
    console.log(error)
    return NextResponse.json({message : error, status : 500})
  }
}