import { verifyToken } from "@/utils/auth";
import { connectToDatabase, supplierSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Supplier = models.Supplier || model('Supplier', supplierSchema)
const Trip = models.Trip || model('Trip', tripSchema)

export async function GET(req: Request, params: { params: { supplierId: string } }) {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    const { supplierId } = params.params;
  
    try {
      // Connect to the MongoDB database
      await connectToDatabase();
  
      // Find the supplier based on supplierId
      const trips = await Trip.find({user_id : user, supplier : supplierId}).select(['trip_id','startDate','truck','route','truckHireCost','status',]).lean()
  
      // Handle case where supplier is not found
      if (!trips) {
        return NextResponse.json({ message: "No trips found" }, { status: 404 });
      }
  
      // Return the supplier details
      return NextResponse.json({ trips : trips }, { status: 200 });
  
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }