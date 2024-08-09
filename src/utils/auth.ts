// utils/auth.ts
import { auth } from '@/firebase/firebaseAdmin';
import { NextRequest } from 'next/server';

export async function verifyToken(req: Request) {
  const tokenResult = fetchCookie(req as NextRequest)
  if(tokenResult.user){
    return {
      user : tokenResult.user.value
    }
  }
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


export function fetchCookie(req: NextRequest) {
  const token = req.cookies.get('auth_token')
  const role = req.cookies.get('selectedRole')
  let user_id = req.cookies.get('userId')
  if (!token) {
    return {
      token: null,
    }
  }
  else {
    if (role && user_id && req.nextUrl.pathname != '/api/login') {
      return {
        user: user_id
      }
    } else {
      return {
        token: token.value
      }
    }
  }
}
