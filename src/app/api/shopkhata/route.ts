import {models, model} from 'mongoose'
import { connectToDatabase, ShopKhataSchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';
import {v4 as uuidv4} from 'uuid'

const ShopKhata = models.ShopKhata || model('ShopKhata', ShopKhataSchema)

export async function GET(req : Request){
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : "Unauthorized User", status : 401})
        }
        await connectToDatabase()
        const shops = await ShopKhata.find({user_id : user})
        return NextResponse.json({shops, status : 200})
    }catch(error){
        console.log(error)
        return NextResponse.json({error, status : 500})
    }
}

export async function POST(req : Request){
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : "Unauthorized User", status : 401})
        }
        const data = await req.json()
        await connectToDatabase()
        const shopId = 'shop' + uuidv4()
        const newShop = new ShopKhata({
            shop_id : shopId,
            user_id : user,
            ...data
        })
        await newShop.save()
        return NextResponse.json({newShop, status : 200})
    }catch(error){
        console.log(error)
        return NextResponse.json({error, status : 500})
    }
}