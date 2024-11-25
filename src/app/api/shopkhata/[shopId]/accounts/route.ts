import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema, OfficeExpenseSchema, ShopKhataAccountsSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const ShopKhataAccounts = models.ShopKhataAccounts || model('ShopKhataAccounts', ShopKhataAccountsSchema)
const Expense = models.Expense || model('Expense', ExpenseSchema)
const OfficeExpense = models.OfficeExpense || model('OfficeExpense', OfficeExpenseSchema)

export async function POST(req : Request, {params } : {params : {shopId : string}}) {
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : "Unauthorized user", status : 401})
        }
        const {shopId} = params
        await connectToDatabase()
        const data = await req.json()
        const newkhata = new ShopKhataAccounts({
            user_id : user,
            shop_id : shopId,
           ...data
        })
        await Promise.all([newkhata.save(), recentActivity('Added Shop Payment', newkhata, user)])
        return NextResponse.json({newkhata,status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error, status : 500})
    }
}

export async function GET(req: Request, { params }: { params: { shopId: string } }) {
    try {
      // Verify user token
      const { user, error } = await verifyToken(req);
      if (!user || error) {
        return NextResponse.json({ error: "Unauthorized user", status: 401 });
      }
  
      const { shopId } = params;
  
      // Connect to the database
      await connectToDatabase();
  
      // Fetch shop khata, expenses, and office expenses concurrently
      const [khata, expenses, officeExpenses] = await Promise.all([
        ShopKhataAccounts.find({ user_id: user, shop_id: shopId }).lean(),  // Fetch khata
        Expense.find({ user_id: user, shop_id: shopId }, { amount: 1, expenseType: 1, paymentMode: 1, date: 1 }).lean(),  // Fetch expenses with selected fields
        OfficeExpense.find({ user_id: user, shop_id: shopId }, { amount: 1, expenseType: 1, paymentMode: 1, date: 1 }).lean(),  // Fetch office expenses
      ]);
  
      // Format expenses and office expenses to match ShopKhataAccountsSchema structure
      const formattedExpenses = expenses.map((expense) => ({
        user_id: user,
        shop_id: shopId,
        reason: expense.expenseType,  // Assign the expense type as the reason
        credit: expense.amount,       // Treat amount as credit
        date: expense.date,
      }));
  
      const formattedOfficeExpenses = officeExpenses.map((officeExpense) => ({
        user_id: user,
        shop_id: shopId,
        reason: officeExpense.expenseType,  // Assign the office expense type as the reason
        credit: officeExpense.amount,       // Treat amount as credit
        date: officeExpense.date,
      }));
  
      // Combine khata, formatted expenses, and formatted office expenses
      const combinedData = [...khata, ...formattedExpenses, ...formattedOfficeExpenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  
      return NextResponse.json({ khata: combinedData, status: 200 });
    } catch (error) {
      console.log(error);
      return NextResponse.json({ error, status: 500 });
    }
  }
  
  