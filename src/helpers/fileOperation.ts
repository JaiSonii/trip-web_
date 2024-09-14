
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pdf from 'pdf-parse-new';
import sharp from 'sharp'
import tesseract from 'node-tesseract-ocr';

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
});


export async function uploadFileToS3(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
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