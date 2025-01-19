import { NextRequest, NextResponse, userAgent } from "next/server";
import jwt from 'jsonwebtoken';

import { model, models } from "mongoose";
import { connectToDatabase, driverSchema, userSchema } from "@/utils/schema";
import { generateUserId } from "@/utils/auth";

const User = models.User || model('User', userSchema);



async function createJWTAndSetCookies(user: any) {
  let jwtObject: any = { user_id: user.user_id, phone: user.phone };
  
  if (user.role?.name === 'driver') {
    const Driver = models.Driver || model('Driver', driverSchema);
    const driver = await Driver.findOne({ user_id: user.role.user, contactNumber: user.phone });
    jwtObject.role = {
      name: 'driver',
      user: user.role.user,
      driver_id: driver?.driver_id,
    };
  } else if (user.role?.name === 'accountant') {
    jwtObject.role = {
      name: 'accountant',
      user: user.role.user,
    };
  }

  const token = jwt.sign(jwtObject, process.env.JWT_SECRET as string, { expiresIn: '30d' });
  const roleToken = jwt.sign({ role: jwtObject.role }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

  const response = NextResponse.json({ message: 'User Logged In', status: 200, roleToken, token });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60,
  });

  if (jwtObject.role) {
    response.cookies.set('role_token', roleToken, {
      path: '/',
      sameSite: 'strict',
    });
  }

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, session, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ message: 'Missing phone or OTP' }, { status: 400 });
    }

    await connectToDatabase();

    // Handle dummy credentials
    if (phone === process.env.DUMMY_CRED_PHONE && otp === process.env.DUMMY_CRED_OTP) {
      const uid = generateUserId(phone);
      let user = await User.findOne({ user_id: uid });

      if (!user) {
        user = new User({ user_id: uid, phone });
        await user.save();
      }

      return await createJWTAndSetCookies(user);
    }

    // Verify OTP via 2Factor API
    const otpResponse = await fetch(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${session}/${otp}`
    );
    const otpData = await otpResponse.json();

    if (otpData.Status !== 'Success') {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    const {device} = userAgent(req)

    const formattedPhone = phone.includes('+91') ? phone.split('+91')[1] : phone;
    const uid = generateUserId(formattedPhone);
    let user = await User.findOne({ user_id: uid });

    if(!user.deviceType){
      user.deviceType = device.type
    }

    if (!user) {
      user = new User({ user_id: uid, phone: formattedPhone });
      await user.save();
    }

    return await createJWTAndSetCookies(user);
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}