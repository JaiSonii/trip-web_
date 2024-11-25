import { uploadFileToS3 } from "@/helpers/fileOperation";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const User = models.User || model('User', userSchema)

export async function GET(req: Request) {
  try {
    const { user, error } = await verifyToken(req)
    if (!user || error) {
      return NextResponse.json({ error })
    }
    await connectToDatabase()
    const userData = await User.findOne({ user_id: user })
    if (!userData) {
      return NextResponse.json({ error: 'User Not Found', status: 400 })
    }
    return NextResponse.json({ status: 200, user: userData })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ status: 500, error: error })
  }
}

export async function PUT(req: Request) {
  try {
    // Verify user
    const { user, error } = await verifyToken(req);
    if (!user || error) {
      return NextResponse.json({ error, status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const data = JSON.parse(formData.get('data') as string);

    // Helper function to upload files
    const uploadIfPresent = async (file: File | null, folder: string) => {
      if (!file) return '';

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${folder}/${user}}`;
      const contentType = file.type;

      // Upload file to S3
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}`;
    };

    // Upload files if present
    const logoFile = formData.get('logo') as File | null;
    const stampFile = formData.get('stamp') as File | null;
    const signatureFile = formData.get('signature') as File | null;

    const logoUrl = await uploadIfPresent(logoFile, 'logos');
    const stampUrl = await uploadIfPresent(stampFile, 'stamps');
    const signatureUrl = await uploadIfPresent(signatureFile, 'signatures');

    // Update data with S3 URLs
    if (logoUrl) data.logoUrl = logoUrl;
    if (stampUrl) data.stampUrl = stampUrl;
    if (signatureUrl) data.signatureUrl = signatureUrl;

    // Connect to database and update user
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate({ user_id: user }, data, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found', status: 400 });
    }

    return NextResponse.json({ status: 200, user: updatedUser });
  } catch (error) {
    console.error('Error in PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}
