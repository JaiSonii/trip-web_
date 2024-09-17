import Trip from "@/components/search/Trip";
import { uploadFileToS3 } from "@/helpers/fileOperation";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Driver = models.Driver || model('Driver', driverSchema)

export async function GET(req : Request,  {params} : {params : {driverId : string}}){
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error})
        }
        const {driverId} = params
        await connectToDatabase()
        const driver = await Driver.findOne({user_id : user, driver_id : driverId}).select(['driver_id','documents']).exec();
        return NextResponse.json({status : 200, documents : driver.documents})
    } catch (error) {
        console.log(error)
        return NextResponse.json({status : 500, error})
    }
}

export async function PUT(req: Request, { params }: { params: { driverId: string } }) {
  try {
      // Verify user token
      const { user, error } = await verifyToken(req);
      if (!user || error) {
          return NextResponse.json({ error: 'Unauthorized User', status: 401 });
      }

      const { driverId } = params;

      // Connect to the database
      await connectToDatabase();

      // Get form data
      const formdata = await req.formData();
      const file = formdata.get('file') as File;
      const docType = formdata.get('docType') as string;
      const validity = new Date(formdata.get('validityDate') as string);
      const filename = formdata.get('filename') as string;

      // Validate form data
      if (!file || !docType || !validity) {
          return NextResponse.json({ error: 'Missing required fields', status: 400 });
      }

      // Find the trip by user and tripId
      const driver = await Driver.findOne({ user_id: user, driver_id : driverId });
      if (!driver) {
          return NextResponse.json({ error: 'Driver not found', status: 404 });
      }

      // Prepare file for upload to S3
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `drivers/${driverId}/${docType}`;
      const contentType = file.type;

      // Upload file to S3
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;

      // Check if the document type already exists in the documents array
      const existingDocIndex = driver.documents.findIndex((doc : any) => doc.type === docType);

      if (existingDocIndex !== -1) {
          // Replace the existing document with the new one
          driver.documents[existingDocIndex] = {
              filename: filename || '',
              type: docType,
              validityDate: validity,
              uploadedDate: new Date(),
              url: fileUrl,
          };
      } else {
          // Add new document if not found
          driver.documents.push({
              filename: filename || '',
              type: docType,
              validityDate: validity,
              uploadedDate: new Date(),
              url: fileUrl,
          });
      }

      // Save the updated trip document
      await driver.save();

      // Return success response
      return NextResponse.json({ message: 'Document uploaded successfully', status: 200 });

  } catch (error) {
      // Log the error and return server error response
      console.error("Error in uploading document:", error);
      return NextResponse.json({ error: 'Failed to upload document', status: 500 });
  }
}

  