
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, draftExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const DraftExpense = models.DraftExpense || model('DraftExpense', draftExpenseSchema);

export async function DELETE(req: Request, { params }: { params: { expenseId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  const { expenseId } = params

  await connectToDatabase()
  try {
    const charge = await DraftExpense.findByIdAndDelete(expenseId)
    if (!charge) {
      return NextResponse.json({ status: 404, message: "Charge Not Found" })
    }
    return NextResponse.json({ message: 'Deletion Success', status: 200, expense: charge })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, status: 500 })
  }
}