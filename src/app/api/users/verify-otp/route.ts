import { NextResponse } from 'next/server';

import { auth } from '@/firebase/firbaseConfig';

export async function POST(request: Request) {
  try {
    const { otp, confirmationResult } = await request.json();

    if (!otp || !confirmationResult) {
      return NextResponse.json({ error: 'OTP and confirmation result are required' }, { status: 400 });
    }

    const result = await confirmationResult.confirm(otp);

    if (result.user) {
      // Handle successful authentication, e.g., issue a token or session
      return NextResponse.json({ success: true, user: result.user }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
  } catch (error : any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
