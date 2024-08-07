import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const User = models.User || model('User', userSchema)

export async function POST(req: NextRequest) {
    await connectToDatabase()
    const data = await req.json();
    console.log(data);
    const phone = data.phone;
    const user = await User.findOne({ phone: phone });

    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' });
    }

    const id = user.user_id;

    await User.findOneAndUpdate(
        { user_id: data.userId },
        {
            $push: {
                accessGiven: {
                    user_id: id,
                    permissions: {
                        edit: data.edit,
                        view: data.view
                    }
                }
            }
        }
    );

    user.haveAccess.push({
        user_id: id,
        permissions: {
            edit: data.edit,
            view: data.view
        }
    });

    await user.save();
    return NextResponse.json({ success: true });
}