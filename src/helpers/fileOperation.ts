
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import pdf from 'pdf-parse-new';
import sharp from 'sharp'
import tesseract from 'node-tesseract-ocr';
import { PDFDocument } from 'pdf-lib';

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
});
 // Assume S3 client is initialized

// Function to compress PDF files
async function compressPDF(pdfBuffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer as any);

    // Compress PDF by removing object streams, or you can apply other optimizations here
    const optimizedPdfBuffer = await pdfDoc.save({
        useObjectStreams: false, // This can slightly reduce the size
    });

    return Buffer.from(optimizedPdfBuffer);
}

// Function to handle image or PDF compression and upload to S3
export async function uploadFileToS3(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string
): Promise<string> {
    let optimizedBuffer = fileBuffer;

    // Compress image if the content type is image
    if (contentType.startsWith('image/')) {
        optimizedBuffer = await sharp(fileBuffer)
            .resize({
                width: 1200, // Resize image to a maximum width of 1200px (optional)
                fit: sharp.fit.inside, // Maintain aspect ratio
            })
            .toBuffer();
    }

    // Compress PDF if the content type is a PDF
    if (contentType === 'application/pdf') {
        optimizedBuffer = await compressPDF(fileBuffer);
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return fileName;
}

export const deleteFileFromS3 = async (fileUrl: string) => {
    try {
      const bucketName = process.env.AWS_S3_BUCKET_NAME!;
      
      // Extract file key from URL
      const fileKey = fileUrl.split(`https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`)[1];
      
      if (!fileKey) {
        throw new Error("Invalid S3 file URL");
      }
  
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });
  
      await s3Client.send(command);
      console.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw new Error("Failed to delete file from S3");
    }
  };


export async function extractValidityDate(text: string): Promise<Date | null> {
    const regex = /(?:valid|vahd)?\s*upto\s*[:\-]?\s*(\d{2})\/(\d{2})\/(\d{4})/i

    const match = text.match(regex);

    if (match) {
        const [_, day, month, year] = match;
        return new Date(`${year}-${month}-${day}`);
    }

    return null;
}

// Function to extract text from a PDF using pdf-parse
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
}

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
    const preprocessedBuffer = await sharp(buffer)
        .resize({ width: 1500 })  // Resize for better OCR accuracy
        .grayscale()  // Convert to grayscale
        .normalize()  // Normalize to enhance contrast
        .sharpen({
            sigma: 1,  // Controls the amount of blur applied before calculating the difference (higher values mean less sharpening)
            m1: 1,     // Controls the level of sharpening (mid-tone)
            m2: 0.5,   // Controls the level of sharpening (shadow area)
            x1: 2,     // Threshold below which the pixels are left unchanged
            y2: 10,    // Controls the range of sharpening applied (upper bound for adjustment)
            y3: 2      // Controls the range of sharpening applied (lower bound for adjustment)
        })
        .median(3)  // Apply median filter to reduce noise
        .threshold(180)  // Binarize the image
        .removeAlpha()  // Remove alpha channel if present
        .toBuffer();

    return preprocessedBuffer;
}

// Function to extract text from an image using node-tesseract-ocr
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
    const preprocessedBuffer = await preprocessImage(buffer);
    const text = await tesseract.recognize(preprocessedBuffer, {
        lang: "eng",
        psm: 3,  // Try different PSM values
        oem: 3,  // Use the best OCR Engine mode
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/:', // Whitelist for known characters
    });
    return text;
}

