import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { phone } = await req.json()
        if (phone === `+91${process.env.DUMMY_CRED_PHONE}`) {
            return NextResponse.json({
                data: {
                    "Status": "Success",
                    "Details": "l60gaseavbemjvlgw7o-7303503698702e11",
                    "OTP": process.env.DUMMY_CRED_OTP
                }, status: 200, message: 'OTP Sent'
            })
        }
        const response = await fetch(`https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN2/`)
        if (!response.ok) {
            return NextResponse.json({ error: 'Internal Server Error' })
        }
        const data = await response.json()
        return NextResponse.json({ data, message: 'OTP sent', status: 200 })
    } catch (error: any) {
        console.log(error)
        return NextResponse.json({ error: error.message, status: 500 })
    }
}