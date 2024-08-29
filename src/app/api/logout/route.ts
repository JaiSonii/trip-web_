import { verifyToken } from "@/utils/auth";
import { connectToDatabase, TokenBlacklistSchema } from "@/utils/schema";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { model, models } from "mongoose";

// Define the TokenBlackList model
const TokenBlackList = models.TokenBlackList || model('TokenBlackList', TokenBlacklistSchema);

export async function GET(req: NextRequest) {
    try {
        // Verify the token
        const { user, error } = await verifyToken(req as Request);
        if (!user || error) {
            return NextResponse.json({ error, status: 401 });
        }

        // Connect to the database
        await connectToDatabase();

        // Get the token from cookies
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Invalid token', status: 400 });
        }

        // Decode the token
        const decoded = jwt.decode(token);

        // Check if the decoded token is a JwtPayload and has the 'exp' property
        if (decoded && typeof decoded !== 'string' && 'exp' in decoded) {
            // Calculate the expiration date
            const expiresAt = new Date((decoded.exp as any)  * 1000);

            // Check if the token is already blacklisted
            const blacklistedToken = await TokenBlackList.findOne({ token });
            if (blacklistedToken) {
                return NextResponse.json({ error: 'Token is already blacklisted', status: 400 });
            }

            // Save the token to the blacklist
            const newToken = new TokenBlackList({ token, expiresAt });
            await newToken.save();

            // Clear the token cookie
            const response = NextResponse.json({ message: 'Token invalidated successfully', status: 200 });
            response.cookies.delete('auth_token');
            response.cookies.delete('role_token')
            return response
        } else {
            return NextResponse.json({ error: 'Invalid token', status: 400 });
        }
    } catch (error) {
        console.error('Error processing token invalidation:', error);
        return NextResponse.json({ error: 'Internal server error', status: 500 });
    }
}
