import { verifyToken } from "@/utils/auth";
import { connectToDatabase } from "@/utils/schema";
import { partySchema } from "@/utils/schema";
import { models, model } from 'mongoose'
import { NextResponse } from "next/server";


const Party = models.Party || model('Party', partySchema)

export async function GET(req: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { partyId } = params;

  try {
    await connectToDatabase();

    const party = await Party.findOne({ party_id: partyId, user_id: user }).lean().exec();

    if (!party) {
      return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    }

    return NextResponse.json({ party: party }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { partyId } = params;
  const data = await req.json()

  try {
    await connectToDatabase();

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (data.gstNumber && !gstRegex.test(data.gstNumber)) {
      return NextResponse.json({ message: 'Invalid GST number' }, { status: 400 });
    }

    // Phone number validation (10 digits starting with 7, 8, or 9)
    const phoneRegex = /^[789]\d{9}$/;
    if (data.contactNumber != '' && !phoneRegex.test(data.contactNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }

    const party = await Party.findOneAndUpdate({ party_id: partyId, user_id: user }, data, { new: true }).lean().exec();

    if (!party) {
      return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    }

    return NextResponse.json({ party: party }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { partyId } = params;

  try {
    await connectToDatabase();

    const party = await Party.findOneAndDelete({ party_id: partyId, user_id: user }).lean().exec();

    if (!party) {
      return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    }

    return NextResponse.json({ party: party }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}