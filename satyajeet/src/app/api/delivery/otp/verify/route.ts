import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../lib/db";
import Order from "@/models/order.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import EmitEventHandler from "../../../../../../lib/EmitEventHandler";

export async function POST(req:NextRequest){
    try {
        await connectDB()
        const {orderId,otp} = await req.json()
        if(!orderId || !otp){
            return NextResponse.json(
                {message:"orderId or OTP not found"},
                {status:400}
            )
        }

        const order = await Order.findById(orderId)
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }

        if(order.deliveryOtp !== otp){
            return NextResponse.json(
                {message:"incorrect or expired otp"},
                {status:400}
            )
        }

        order.status = "delivered"
        order.deliveryOtpVerificaion = true
        order.deliveredAt = new Date()
        await order.save()

        await EmitEventHandler("order-status-update",{orderId:order._id,status:order.status})

        await DeliveryAssignment.updateOne(
            {order:orderId},
            {$set:{assignedTo:null,status:"completed"}}
        )

        return NextResponse.json(
            {message:"delivery successfully complted"},
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`otp verify error ${error}`},
            {status:500}
        )
    }
}