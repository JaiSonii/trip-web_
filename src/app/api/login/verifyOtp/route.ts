import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { model, models } from "mongoose";
import { connectToDatabase, userSchema } from "@/utils/schema";

const User = models.User || model('User', userSchema);

function generateUserId(phoneNumber: string): string {
  // Remove any non-digit characters from the phone number
  const sanitizedPhone = phoneNumber.replace(/\D/g, '');

  // Generate a SHA-256 hash of the sanitized phone number
  const hash = crypto.createHash('sha256').update(sanitizedPhone).digest('hex');

  // Truncate the hash to create a user_id
  return hash.substring(0, 16);
}

export async function POST(req: NextRequest) {
  const { phone, session, otp } = await req.json();
  console.log(session)
  console.log(phone)
  console.log(otp)

  try {
    const response = await fetch(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${session}/${otp}`
    );

    const data = await response.json();
    console.log(data)

    await connectToDatabase()
    if (data.Status === 'Success') {
      const uid = generateUserId(phone);
      let user = await User.findOne({ user_id: uid });

      if (!user) {
        user = new User({
          user_id: uid,
          phone, // Store the phone number in the database
        });
        await user.save();
      }

      // Create a JWT token with relevant user data
      const token = jwt.sign(
        { user_id: user.user_id, phone: user.phone },
        process.env.JWT_SECRET as string,
        { expiresIn: '10d' }
      );

      // Set the auth token in cookies
      const response = NextResponse.json({ message: 'User logged in', status: 200 });
      response.cookies.set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      return response;
    } else {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: 'Error verifying OTP' }, { status: 500 });
  }
}
