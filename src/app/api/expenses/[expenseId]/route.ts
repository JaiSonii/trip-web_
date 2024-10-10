import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Expense = models.Expense || model('Expense', ExpenseSchema)

export async function PUT(req: Request, { params }: { params: { expenseId: string } }) {
  // Connect to the database
  await connectToDatabase();
  const { expenseId } = params

  // Extract the tripId from the request params

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    const formdata = await req.formData()
    const file = formdata.get('file')
    const expenseData = JSON.parse(formdata.get('expense') as string);
    await connectToDatabase()

    // Create a new instance of TripExpense with the parsed data and tripId
    const charge = await Expense.findByIdAndUpdate(expenseId, expenseData, { new: true })

    // Return a success response with the new charge
    return NextResponse.json({ status: 200, expense: charge });

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

  const { expenseId } = params

  await connectToDatabase()
  try {
    const charge = await Expense.findByIdAndDelete(expenseId)
    if (!charge) {
      return NextResponse.json({ status: 404, message: "Charge Not Found" })
    }
    return NextResponse.json({ message: 'Deletion Success', status: 200, expense: charge })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, status: 500 })
  }
}