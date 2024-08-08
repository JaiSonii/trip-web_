import { NextResponse } from 'next/server';
import { auth } from '@/firebase/firbaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';



export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    console.log(phone)

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });

    const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);

    return NextResponse.json({ confirmationResult }, { status: 200 });
  } catch (error : any) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
