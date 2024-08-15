import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { model, models } from "mongoose";
import { tripSchema } from "@/utils/schema";

const s3Client = new S3Client({
	region: process.env.AWS_S3_REGION,
	credentials: {
		accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
	},
});

const Trip = models.Trip || model('Trip', tripSchema)

async function uploadFileToS3(fileBuffer: Buffer, fileName: string): Promise<string> {
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME!,
		Key: fileName,
		Body: fileBuffer,
		ContentType: "image/jpg",
	};

	const command = new PutObjectCommand(params);
	await s3Client.send(command);
	return fileName;
}

export async function POST(request: Request) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const tripId = formData.get("tripId") as string;
  
      if (!file || !tripId) {
        return NextResponse.json({ error: "File and tripId are required." }, { status: 400 });
      }
  
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `trips/ewaybill-${tripId}`; // Store in trips/ewaybill folder with tripId
  
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      };
  
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
  
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;

      const trip = await Trip.findOneAndUpdate({trip_id : tripId}, {ewayBill : fileUrl})

  
      return NextResponse.json({ success: true, fileUrl });
    } catch (error) {
      console.error("Error uploading e-way bill:", error);
      return NextResponse.json({ error: "Failed to upload e-way bill." }, { status: 500 });
    }
  }
