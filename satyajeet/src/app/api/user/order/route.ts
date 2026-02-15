import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import User from "@/models/user.model";
import Order from "@/models/order.model";
import EmitEventHandler from "../../../../../lib/EmitEventHandler";

export async function POST(req:NextRequest){
    try {
        await connectDB()
        const {userId,items,paymentMethod,totalAmount,address} = await req.json()
        if(!items || !userId || !paymentMethod || !totalAmount || !address){
            return NextResponse.json(
                {message:"please send all credentials"},
                {status:400}
            )
        }
        const user = await User.findById(userId)
        if(!user){
             return NextResponse.json(
                {message:"user not found"},
                {status:400}
            )
        }

        const newOrder = await Order.create({
            user:userId,
            items,
            paymentMethod,
            totalAmount,
            address
        })

        await EmitEventHandler("new-order",newOrder)

        return NextResponse.json(
            newOrder,
            {status:200}
        )
    } catch (error) {
         return NextResponse.json(
                {message:`place order error ${error}`},
                {status:500}
            )
    }
}