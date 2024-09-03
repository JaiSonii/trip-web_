import { NextResponse } from 'next/server';
import { connectToDatabase, tripSchema } from '@/utils/schema';
import { model, models } from 'mongoose';
import { verifyToken } from '@/utils/auth';

const Trip = models.Trip || model('Trip', tripSchema);



export async function GET(request: Request) {
  try {
    const { user, error } = await verifyToken(request);
    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized User', status: 401 });
    }
    await connectToDatabase();

    // Fetch only the required fields from the trips collection
    const trips = await Trip.find({ user_id: user, ewayBill: { $ne: '' } }, 'startDate ewayBill trip_id ewbValidityDate route POD').lean();

    // Generate presigned URLs for the fetched trips
    // const tripsWithPresignedUrls = trips.map(trip => {
    //   const presignedUrl = s3.getSignedUrl('getObject', {
    //     Bucket: 'awajahi-doc-store', // Replace with your bucket name
    //     Key: trip.ewayBill, // The key (filename) of the ewayBill in S3
    //     Expires: 60 * 60, // Presigned URL expiration time in seconds (1 hour here)
    //   });

    //   return {
    //     ...trip,
    //     ewayBillUrl: presignedUrl,
    //   };
    // });

    return NextResponse.json(trips);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}
