import { verifyToken } from "@/utils/auth"
import { connectToDatabase, PartyPaymentSchema } from "@/utils/schema"
import { model, models } from "mongoose"
import { NextResponse } from "next/server"

const PartyPayment = models.PartyPayment || model('PartyPayment', PartyPaymentSchema)

export async function PUT(req : Request, {params} : {params : {paymentId : string}}){
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.redirect('/api/logout')
        }
        const data = await req.json()
        const {paymentId} = params
        await connectToDatabase()
        const payment = await PartyPayment.findByIdAndUpdate(paymentId, data, {new : true})
        return NextResponse.json({payment, status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error, status : 500})
    }
}

export async function DELETE(req : Request, {params} : {params : {paymentId : string}}){
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.redirect('/api/logout')
        }
        const {paymentId} = params
        await connectToDatabase()
        const payment = await PartyPayment.findByIdAndDelete(paymentId)
        return NextResponse.json({payment, status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error, status : 500})
    }
}