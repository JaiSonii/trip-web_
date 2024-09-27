import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripChargesSchema, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);

export async function GET(req: Request) {
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }

    const url = new URL(req.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    await connectToDatabase();

    if (!month || !year) {
        const tripExpense = await Expense.find({ user_id: user , trip_id: { $exists: true, $ne: '' }}).sort({date : -1}).lean();
        return NextResponse.json({ tripExpense, status: 200 });
    }

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

    const startDate = new Date(parseInt(year), monthNumber, 1);
    const endDate = new Date(parseInt(year), monthNumber + 1, 1);

    try {
        const [tripExpense, truckExpense] = await Promise.all([
            TripCharges.find({
                user_id: user,
                date: {
                    $gte: startDate,
                    $lt: endDate
                },
                partyBill: false
            }).lean(),
            Expense.find({
                user_id: user,
                date: {
                    $gte: startDate,
                    $lt: endDate
                },
                trip_id: { $exists: true, $ne: '' }
            }).lean()
        ]);

        const combinedExpenses = [...tripExpense, ...truckExpense];

        return NextResponse.json({ combinedExpenses, status: 200 });
    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ message: err.message, status: 500 });
    }
}
