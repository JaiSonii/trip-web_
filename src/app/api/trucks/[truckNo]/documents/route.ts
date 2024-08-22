
import { uploadFileToS3 } from "@/helpers/S3Operation";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema, truckSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Truck = models.Truck || model('Truck', truckSchema)

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.json({ error })
        }
        const { truckNo } = params
        await connectToDatabase()
        const truck = await Truck.findOne({ user_id: user, truckNo: truckNo }).select(['truckNo', 'documents']).exec();
        
        return NextResponse.json({ status: 200, documents: truck.documents })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, error })
    }
}

export async function POST(request: Request, { params }: { params: { truckNo: string } }) {
    try {
        const { user, error } = await verifyToken(request)
        if (!user || error) {
            return NextResponse.json({ error })
        }

        const { truckNo } = params
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const docType = formData.get("docType") as string;

        if (!file || !docType) {
            return NextResponse.json({ error: "File and document type are required." }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `trucks/${truckNo}/${docType}`;
        const contentType = file.type;

        // Upload the file to S3
        const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;

        // Connect to the database and update the truck document with the specific field for the document type
        await connectToDatabase()
        const updateField = `documents.${docType}`;
        const truck = await Truck.findOneAndUpdate(
            { user_id: user, truckNo: truckNo },
            { $set: { [updateField]: fileUrl } },
            { new: true }
        );

        if (!truck) {
            return NextResponse.json({ error: "Truck not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, documents: truck.documents });
    } catch (error) {
        console.error("Error uploading document:", error);
        return NextResponse.json({ error: "Failed to upload document." }, { status: 500 });
    }
}
