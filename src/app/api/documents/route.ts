import { uploadFileToS3 } from "@/helpers/fileOperation";
import { verifyToken } from "@/utils/auth";
import { otherDocumentsSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";
import {v4 as uuidV4} from 'uuid'

const OtherDocuments = models.OtherDocuments || model('OtherDocuments', otherDocumentsSchema);


export async function GET(req: Request) {
  try {
    // Verify user token
    const { user, error } = await verifyToken(req);

    if (!user || error) {
      throw new Error('Unauthorized user');
    }

    // Fetch documents for the user
    const documents = await OtherDocuments.find({ user_id: user });
    return NextResponse.json({
      status: 200,
      documents,
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);

    // Handle unauthorized user
    if (error.message === 'Unauthorized user') {
      const response = NextResponse.json({
        status: 401,
        error: 'Unauthorized',
      });

      // Remove the auth_token cookie
      response.cookies.set('auth_token', '', { maxAge: 0 });
      return response;
    }

    // Handle internal server error
    return NextResponse.json({
      status: 500,
      error: 'Internal Server Error',
    });
  }
}

export async function POST(req: Request) {
    try {
      // Verify user token
      const { user, error } = await verifyToken(req);
  
      if (!user || error) {
        throw new Error('Unauthorized user');
      }
  
      // Parse form data
      const formData = await req.formData();
      const data = JSON.parse(formData.get('data') as string);
      const file = formData.get('file') as File;
  
      // Validate required fields
      if (!data.filename || !file) {
        return NextResponse.json({
          error: 'Filename and file are required',
          status: 400,
        });
      }
  
      // Prepare file for S3 upload
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `users/${user}/${uuidV4()}`;
      const contentType = file.type;
  
      // Upload file to S3
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}`;
  
      // Create a new document record
      const newDocument = new OtherDocuments({
        user_id: user,
        filename: data.filename,
        url: fileUrl,
        uploadedDate: new Date(Date.now()),
        validityDate: data.validityDate || null, // Handle optional validityDate
      });
  
      await newDocument.save();
  
      // Return the newly created document
      return NextResponse.json({
        status: 200,
        message: 'Document uploaded successfully',
        document: newDocument
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
  
      // Handle unauthorized user
      if (error.message === 'Unauthorized user') {
        const response = NextResponse.json({
          status: 401,
          error: 'Unauthorized',
        });
  
        // Remove the auth_token cookie
        // response.cookies.set('auth_token', '', { maxAge: 0 });
        return response;
      }
  
      // Handle other errors
      return NextResponse.json({
        status: 500,
        error: 'Internal Server Error',
      });
    }
  }
