import { verifyToken } from "@/utils/auth";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/firebaseAdmin";
import { encryptData } from "@/utils/encryption";

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

        if (!phone || !role) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Check if the user exists in Firebase
        let userRecord;
        try {
            userRecord = await auth.getUserByPhoneNumber(phone);
        } catch (firebaseError : any) {
            if (firebaseError.code === 'auth/user-not-found') {
                userRecord = await auth.createUser({
                    phoneNumber: phone,
                });
            } else {
                console.error('Firebase error:', firebaseError);
                return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
            }
        }

        const uid = userRecord.uid;
        const encryptedPhone = encryptData(phone);

        // Now query your database with the uid from Firebase
        let existingUser = await User.findOne({ user_id: uid });

        if (!existingUser) {
            // If the user does not exist in your database, create a new one
            const newUser = new User({
                user_id: uid,
                phone: encryptedPhone,
                [role]: data.userId,
            });
            await newUser.save();
        } else {
            // If the user exists, update the role or any other necessary fields
            existingUser[role] = data.userId;
            await existingUser.save();
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('Error processing request:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
