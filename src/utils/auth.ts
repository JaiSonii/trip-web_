// utils/auth.ts
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { connectToDatabase, TokenBlacklistSchema } from '@/utils/schema'; // Import your schema
import { model, models } from 'mongoose';

// Define the TokenBlackList model
const TokenBlackList = models.TokenBlackList || model('TokenBlackList', TokenBlacklistSchema);

export async function verifyToken(req: Request) {
  const tokenResult = fetchCookie(req as NextRequest);
  
  if (tokenResult.user) {
    return { user: tokenResult.user };
  }
  
  const token = tokenResult.token;
  
  if (!token) {
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    // Connect to the database to check the blacklist
    await connectToDatabase();
    
    // Check if the token is blacklisted
    const blacklistedToken = await TokenBlackList.findOne({ token });
    if (blacklistedToken) {
      return { error: 'Unauthorized: Token is blacklisted' };
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Optionally, you can add more checks for the token payload
    return { user: decodedToken.user_id };
  } catch (err) {
    return { error: 'Unauthorized: Invalid token' };
  }
}

export function fetchCookie(req: NextRequest) {
  const token = req.cookies.get('auth_token');
  const role = req.cookies.get('selectedRole');
  let user_id = req.cookies.get('userId');
  
  if (!token) {
    return { token: null };
  } else {
    if (role && user_id && req.nextUrl.pathname !== '/api/login') {
      return { user: user_id };
    } else {
      return { token: token.value };
    }
  }
}
