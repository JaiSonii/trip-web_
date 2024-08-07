// utils/auth.ts
import { auth } from '@/firebase/firebaseAdmin';
import { NextRequest } from 'next/server';

export async function verifyToken(req: Request) {
  const tokenResult = fetchCookie(req as NextRequest)
  const token = tokenResult.token
  if (!token) {
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return { user: decodedToken.uid };
  } catch (err) {
    return { error: 'Unauthorized: Invalid token' };
  }
}


export function fetchCookie(req : NextRequest) {
  const token = req.cookies.get('auth_token')
  console.log(token)
  const user = req.cookies.get('cur_user')
  console.log(user)
  if (!token) {
    return {
      token: null,
    }
  }
  else{
    return {
      token : token.value
    }
  }
}
