import { NextResponse } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { connectToDatabase, truckSchema } from '@/utils/schema';
import { TruckModel } from '@/utils/interface';

const Truck = models.Truck || model('Truck', truckSchema);

export async function GET() {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect('mongodb://localhost:27017/transportbook', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    }

    const trucks = await Truck.find().exec();
    return NextResponse.json({ trucks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase(); // Ensure database connection is established

    // Parse incoming JSON data from request body
    const data = await req.json();

    // Validate required fields
    if (!data.truckNo) {
      throw new Error('Truck Number is required');
    }
    if (!data.ownership) {
      throw new Error('Ownership type is required');
    }
    if (data.ownership === 'Market' && !data.supplier) {
      throw new Error('Supplier is required for Market ownership');
    }

    // Create a new TruckModel instance with provided data
    const newTruck = new Truck({
      truckNo: data.truckNo,
      truckType: data.truckType || '',
      model: data.model || '',
      capacity: data.capacity || '',
      bodyLength: data.bodyLength || null,
      ownership: data.ownership,
      supplier: data.supplier || '',
      status: 'Available',
      trip_id : '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the new truck instance to the database
    const truck = await newTruck.save();

    // Return successful response with created truck data
    return NextResponse.json({ truck }, { status: 200 });
  } catch (error : any) {
    // Handle errors during request processing
    console.error('Error creating truck:', error);
    
    // Return error response with appropriate status code and message
    return NextResponse.json({ error: error.message || 'Failed to create truck' }, { status: 500 });
  }
}
