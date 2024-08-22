import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function uploadFileToS3(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const s3Client = new S3Client({
        region: process.env.AWS_S3_REGION,
        credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
        },
      });
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    };
  
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
  }