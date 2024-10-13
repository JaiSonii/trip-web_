import { NextResponse } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { connectToDatabase, truckSchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { v4 as uuidv4 } from 'uuid'
import { validateTruckNo } from '@/utils/validate';


const Truck = models.Truck || model('Truck', truckSchema);

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    await connectToDatabase()

    const trucks = await Truck.aggregate([{
      $match: { user_id: user },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: 'supplier_id',
        as: 'suppliers'
      }
    },
    {
      $addFields: {
        supplierName: { $arrayElemAt: ['$suppliers.name', 0] }
      }
    }
    ]);
    return NextResponse.json({ trucks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  const { user, error } = await verifyToken(req); // Authenticate the user

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    await connectToDatabase(); // Ensure DB connection

    const data = await req.json(); // Parse request body

    // Validate truck number format
    if (!validateTruckNo(data.truckNo)) {
      return NextResponse.json({ error: 'Enter a valid Truck No' }, { status: 400 });
    }

    // Validate required fields
    if (!data.truckNo) {
      return NextResponse.json({ error: 'Truck Number is required' }, { status: 400 });
    }
    if (!data.ownership) {
      return NextResponse.json({ error: 'Ownership type is required' }, { status: 400 });
    }
    if (data.ownership === 'Market' && !data.supplier) {
      return NextResponse.json({ error: 'Supplier is required for Market ownership' }, { status: 400 });
    }

    // Check if truck with the same `truckNo` exists for the same user
    const existingTruck = await Truck.findOne({ user_id: user, truckNo: data.truckNo.toUpperCase() });

    if (existingTruck) {
      return NextResponse.json({ error: 'Lorry Already Exists', status: 400 });
    }

    // Create a new truck entry
    const newTruck = new Truck({
      user_id: user,
      truck_id: 'truck_id' + uuidv4(),
      truckNo: data.truckNo.toUpperCase(),
      truckType: data.truckType || '',
      model: data.model || '',
      capacity: data.capacity || '',
      bodyLength: data.bodyLength || null,
      ownership: data.ownership,
      supplier: data.supplier || '',
      status: 'Available',
      trip_id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      driver_id: data.driver || '',
    });

    // Save to the database
    const truck = await newTruck.save();

    return NextResponse.json({ truck, status: 200 });
  } catch (error: any) {
    console.error('Error creating truck:', error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Lorry Already Exists', status: 400 });
    }

    return NextResponse.json({ error: error.message || 'Failed to add lorry' }, { status: 500 });
  }
}
