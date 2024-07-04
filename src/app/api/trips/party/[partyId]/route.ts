import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { tripSchema } from '@/utils/schema';
import { partySchema } from '@/utils/schema'; // Assuming you have a Party model
import { ObjectId } from 'mongoose';

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
const Party = mongoose.models.Party || mongoose.model('Party', partySchema)

export async function GET(request: Request, { params }: { params: { partyId: string } }) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect('mongodb://localhost:27017/transportbook', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    }

    const { partyId } = params;
    const trips = await Trip.find({ party_id: partyId }).exec();
    console.log(trips)

    return NextResponse.json({ trips });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
