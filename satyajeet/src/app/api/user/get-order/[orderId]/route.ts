import Order from "@/models/order.model";
import connectDB from "../../../../../../lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req:NextRequest,context: { params: Promise<{ orderId: string; }>;}){
    try {
        await connectDB()
        const {orderId} = await context.params
        console.log("user get order",orderId)
        const order = await Order.findById(orderId).populate("assignedDeliveryBoy")
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }
        return NextResponse.json(
            order,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`user get-order error ${error}`},
            {status:500}
        )
    }
}