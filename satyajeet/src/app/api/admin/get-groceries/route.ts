import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Grocery from "@/models/grocery.model";

export async function GET(){
    try {
        await connectDB()
        const groceries = await Grocery.find({})
        return NextResponse.json(groceries,{status:200})
    } catch (error) {
        return NextResponse.json(
            {message:`get groceries error ${error}`},
            {status:500}
        )
    }
}