import DeliveryAssignment from "@/models/deliveryAssignment.model";
import connectDB from "../../../../../lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectDB()
        const session = await auth()
        console.log("kotak",session)
        const assignments = await DeliveryAssignment.find({
            brodcastedTo:session?.user?.id,
            status:"brodcasted"
        }).populate("order")

        return NextResponse.json(
            assignments,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`get assignment error ${error}`},
            {status:500}
        )
  }
}