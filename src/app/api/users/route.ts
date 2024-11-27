import { uploadFileToS3 } from "@/helpers/fileOperation";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";
import { v4 as uuidV4 } from 'uuid'

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


export async function PATCH(req: Request) {
  try {
    // Verify token
    const { user, error } = await verifyToken(req);
    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized access', status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const files: File[] = [];
    const filenames: string[] = [];

    console.log(formData)

    // Collect all files and filenames
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('filename')) {
        filenames.push(value as string);
      } else if (key.startsWith('file')) {
        files.push(value as File);
      }
    }



    // Validation: Ensure files and filenames match
    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one file is required', status: 400 });
    }
    if (files.length !== filenames.length) {
      return NextResponse.json({ error: 'Mismatched files and filenames', status: 400 });
    }

    const uploadedDocuments = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = filenames[i] || file.name;

      // Convert file to buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `users/${user}/${uuidV4()}`;
      const contentType = file.type;

      // Upload file to S3
      const s3Filename = await uploadFileToS3(fileBuffer, fileName, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Filename}${contentType === 'application/pdf' ? '.pdf' : ''}`;

      // Prepare document data
      uploadedDocuments.push({
        filename,
        uploadedDate: new Date(),
        url: fileUrl,
      });
    }

    // Update user's document list
    const updatedUser = await User.findOneAndUpdate(
      { user_id: user },
      { $push: { documents: { $each: uploadedDocuments, $position: 0 } } },
      { new: true, projection: { user_id: 0 } } // Exclude `user_id` from the returned data
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found', status: 404 });
    }

    return NextResponse.json({
      message: `${uploadedDocuments.length} document(s) added successfully`,
      status: 200,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user documents:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
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
      const fileName = `${folder}/${user}`;
      const contentType = file.type;

      // Upload file to S3
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf'? '.pdf' : ''}`;
    };

    // Upload files if present
    const logoFile = formData.get('logo') as File | null;
    const stampFile = formData.get('stamp') as File | null;
    const signatureFile = formData.get('signature') as File | null;

    const logoUrl = await uploadIfPresent(logoFile, 'logos');
    const stampUrl = await uploadIfPresent(stampFile, 'stamps');
    const signatureUrl = await uploadIfPresent(signatureFile, 'signatures');


    // Update data with S3 URLs


    // Connect to database and update user
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate({ user_id: user }, data, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found', status: 400 });
    }

    if (logoUrl) updatedUser.logoUrl = logoUrl;
    if (stampUrl) updatedUser.stampUrl = stampUrl;
    if (signatureUrl) updatedUser.signatureUrl = signatureUrl;

    await updatedUser.save()

    return NextResponse.json({ status: 200, user: updatedUser });
  } catch (error) {
    console.error('Error in PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}
