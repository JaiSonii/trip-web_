import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema, OfficeExpenseSchema, tripChargesSchema, tripSchema, truckSchema } from "@/utils/schema";
import { monthMap } from "@/utils/utilArray";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);
const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema);
const Truck = models.Truck || model('Truck', truckSchema);
const OfficeExpense = models.OfficeExpense || model('OfficeExpense', OfficeExpenseSchema);

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }

        const url = new URL(req.url);
        const month = url.searchParams.get('month');
        const year = url.searchParams.get('year');

        const monthNumber = monthMap[month as any];
        if (monthNumber === undefined) {
            return NextResponse.json({ error: 'Invalid month name', status: 400 });
        }

        const startDate = new Date(year as any, monthNumber, 1);
        const endDate = new Date(year as any, monthNumber + 1, 1);

        await connectToDatabase();

        const tripsData = await Trip.aggregate([
            {
                $match: {
                    user_id: user,
                    startDate: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $lookup: {
                    from: 'trucks',
                    localField: 'truck',
                    foreignField: 'truckNo',
                    as: 'truckDetails'
                }
            },
            { $unwind: '$truckDetails' },
            {
                $lookup: {
                    from: 'tripcharges',
                    localField: 'trip_id',
                    foreignField: 'trip_id',
                    as: 'charges'
                }
            },
            { $unwind: { path: '$charges', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$truckDetails.ownership',
                    totalFreight: { $sum: '$amount' },
                    totalCharges: {
                        $sum: {
                            $cond: [{ $eq: ['$charges.partyBill', true] }, '$charges.amount', 0]
                        }
                    },
                    totalDeductions: {
                        $sum: {
                            $cond: [{ $eq: ['$charges.partyBill', false] }, '$charges.amount', 0]
                        }
                    },
                    tripCount: { $sum: 1 },
                    trips: { $push: '$$ROOT' }
                }
            }
        ]);

        const marketTruckTrips = tripsData.find(d => d._id === 'Market') || { trips: [], totalFreight: 0, totalCharges: 0, totalDeductions: 0 };
        const ownTruckTrips = tripsData.find(d => d._id === 'Self') || { trips: [], totalFreight: 0, totalCharges: 0, totalDeductions: 0 };

        const [expenses, officeExpenses] = await Promise.all([
            Expense.find({ user_id: user, date: { $gte: startDate, $lt: endDate } }).select('amount').lean(),
            OfficeExpense.find({ user_id: user, date: { $gte: startDate, $lt: endDate } }).select('amount').lean()
        ]);

        const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
        const totalOfficeExpense = officeExpenses.reduce((total, expense) => total + expense.amount, 0);

        const marketTruckProfit = marketTruckTrips.totalFreight + marketTruckTrips.totalCharges - marketTruckTrips.totalDeductions - totalExpense;
        const ownTruckProfit = ownTruckTrips.totalFreight + ownTruckTrips.totalCharges - ownTruckTrips.totalDeductions - totalOfficeExpense;

        const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balance Report</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .bg-bottomNavBarColor {
            background-color: #CC5500;
        }
        .text-primaryOrange {
            color: #ff6a00;
        }
        .text-lightOrange {
            color: #ffa666;
        }
        .bg-lightOrangeButtonColor {
            background-color: #ffcaA4;
        }
        .container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            max-width: 100vw; /* Ensure content fits within viewport width */
            max-height: 100vh; /* Ensure content fits within viewport height */
            overflow: hidden;
            padding: 0 1rem; /* Padding for small screen adjustments */
        }
        .content {
            width: 100%;
            max-width: 1000px; /* Adjust max width as needed */
            height: 100%;
            overflow-y: auto;
        }
        .box {
            max-height: calc(100vh / 5); /* Adjust based on the number of boxes */
            padding: 1rem; /* Reduced padding for better fit */
            margin-bottom: 0.5rem; /* Reduced margin for better fit */
        }
        .text-box {
            font-size: 0.875rem; /* Smaller font size for fitting content */
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container">
        <div class="content">
            <h1 class="text-lg md:text-xl font-bold text-buttonTextColor text-center mb-4">Balance Report for ${month} ${year}</h1>

            <div class="box bg-lightOrangeButtonColor text-buttonTextColor font-bold rounded-lg shadow-lg text-sm md:text-base text-box">
                <span>Overall Profit : <span class="text-green-600">${ownTruckProfit + marketTruckProfit}</span></span>
            </div>

            <div class="box bg-lightOrangeButtonColor text-gray-900 font-semibold rounded-lg shadow-lg text-sm md:text-base text-box">
                <h2>Total Trips for ${month} ${year}: ${marketTruckTrips.tripCount + ownTruckTrips.tripCount}</h2>
            </div>

            <div class="box bg-lightOrangeButtonColor text-gray-900 font-semibold rounded-lg shadow-lg text-sm md:text-base text-box">
                <h2>Overall Revenue for ${month} ${year}: ${marketTruckProfit + ownTruckProfit}</h2>
            </div>

            <div class="box bg-lightOrangeButtonColor shadow-lg rounded-lg text-sm md:text-base text-box">
                <h2>Revenue from Market Trucks</h2>
                <p>Total Freight: <span class="font-bold">${marketTruckTrips.totalFreight}</span></p>
                <p>Total Charges: <span class="font-bold text-green-600">${marketTruckTrips.totalCharges}</span></p>
                <p>Total Deductions: <span class="font-bold text-red-600">${marketTruckTrips.totalDeductions}</span></p>
                <p>Profit: <span class="font-bold text-green-600">${marketTruckProfit}</span></p>
            </div>

            <div class="box bg-lightOrangeButtonColor shadow-lg rounded-lg text-sm md:text-base text-box">
                <h2>Own Trucks</h2>
                <p>Total Freight: <span class="font-bold">${ownTruckTrips.totalFreight}</span></p>
                <p>Total Charges: <span class="font-bold text-green-600">${ownTruckTrips.totalCharges}</span></p>
                <p>Total Deductions: <span class="font-bold text-red-600">${ownTruckTrips.totalDeductions}</span></p>
                <p>Profit: <span class="font-bold text-green-600">${ownTruckProfit}</span></p>
            </div>

            <div class="box bg-lightOrangeButtonColor shadow-lg rounded-lg text-sm md:text-base text-box">
                <h2>Expenses</h2>
                <p>Total Expense: <span class="font-bold text-red-600">${totalExpense}</span></p>
                <p>Total Office Expense: <span class="font-bold text-red-600">${totalOfficeExpense}</span></p>
            </div>
        </div>
    </div>
</body>
</html>







`;

        return new Response(htmlReport, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
