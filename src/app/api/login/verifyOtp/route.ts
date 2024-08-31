import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

import { model, models } from "mongoose";
import { connectToDatabase, driverSchema, userSchema } from "@/utils/schema";
import { generateUserId } from "@/utils/auth";

const User = models.User || model('User', userSchema);



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
      let jwtObject: any = {};
      if (user.role?.name === 'driver') {
        const Driver = models.Driver || model('Driver', driverSchema);
        const driver = await Driver.findOne({ user_id: user.role.user, contactNumber: user.phone });
        jwtObject = {
          user_id: user.user_id,
          phone: user.phone,
          role: {
            name: 'driver',
            user: user.role.user,
            driver_id: driver?.driver_id
          }
        };
      } else if (user.role?.name === 'accountant') {
        jwtObject = {
          user_id: user.user_id,
          phone: user.phone,
          role: {
            name: 'accountant',
            user: user.role.user
          }
        };
      } else {
        jwtObject = { user_id: user.user_id, phone: user.phone };
      }

      const token = jwt.sign(
        jwtObject,
        process.env.JWT_SECRET as string,
        { expiresIn: '10d' }
      );
      const roleToken = jwt.sign(
        { role: jwtObject.role  },
        process.env.JWT_SECRET as string,
        { expiresIn: '10d' }
      );

      let response 

      if(jwtObject.role){
        response = NextResponse.json({message : 'User Logged In', status : 200, roleToken,token})
        response.cookies.set('role_token', roleToken, {
          path: '/',
          sameSite: 'strict',
        });

      }else{
        response = NextResponse.json({message : 'User Logged In', status : 200, roleToken,token, jwtObject})
        
      }

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/', // Set path to the root to ensure it's accessible across the app
        sameSite: 'strict', // CSRF protection
      });

      return response;


      // Set the auth token in cooki
    } else {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: 'Error verifying OTP' }, { status: 500 });
  }
}
