import { verifyToken } from "@/utils/auth";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/firebaseAdmin";

const User = models.User || model('User', userSchema);

export async function POST(req: NextRequest) {
    try {
        const { user, error } = await verifyToken(req as Request);
        
        if (!user || error) {
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        await connectToDatabase();

        const data = await req.json();
        const phone = data.phone;
        const role = data.role;

        // Input validation could be added here
        if (!phone || !role) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        let existingUser = await User.findOne({ phone: phone });

        if (!existingUser) {
            const userRecord = await auth.createUser({
                phoneNumber : phone
            })
            let uid = userRecord.uid
            const newUser = new User({
                user_id: uid,
                phone: phone,
                [role]: data.userId
            });
            await newUser.save();
        } else {
            existingUser[role] = data.userId;
            await existingUser.save();
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('Error processing request:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
