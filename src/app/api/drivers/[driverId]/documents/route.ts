import Trip from "@/components/search/Trip";
import { uploadFileToS3 } from "@/helpers/S3Operation";
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

export async function POST(request: Request, { params }: { params: { driverId: string } }) {
  try {
    const { user, error } = await verifyToken(request)
    if (!user || error) {
      return NextResponse.json({ error })
    }

    const { driverId } = params
    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string

    if (!file || !name) {
      return NextResponse.json({ error: "File and name are required." }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = `drivers/${driverId}/${name}`
    const contentType = file.type

    // Upload the file to S3
    const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType)
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`

    // Update the Driver document with the uploaded document
    await connectToDatabase()
    const update = { [`documents.${name}`]: fileUrl }
    const driver = await Driver.findOneAndUpdate({ user_id: user, driver_id: driverId }, { $set: update }, { new: true })

    return NextResponse.json({ success: true, documents: driver.documents })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Failed to upload document." }, { status: 500 })
  }
}

  