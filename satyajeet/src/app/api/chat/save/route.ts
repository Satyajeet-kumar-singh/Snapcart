import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Message from "@/models/message.model";
import Order from "@/models/order.model";

export async function POST(req:NextRequest){
    try {
        await connectDB()
        const {senderId,text,roomId,time} = await req.json()
        const room = await Order.findById(roomId)
        if(!room){
            return NextResponse.json(
                {message:"room not found"},
                {status:400}
            )
        }

        const messages = await Message.create({
            senderId,text,roomId,time
        })

        return NextResponse.json(
            messages,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`chat save error ${error}`},
            {status:500}
        )
    }
}