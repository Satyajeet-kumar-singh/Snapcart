import connectDB from "../../../../../lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import uploadOnCloudinary from "../../../../../lib/Cloudinary";
import Grocery from "@/models/grocery.model";

export async function POST(req:NextRequest){
    try {
        await connectDB()
        const session = await auth()
        if(session?.user?.role !== "admin"){
            return NextResponse.json(
                {message:'you are not admin'},
                {status:400}
            )
        }

        const formData = await req.formData()
        const groceryId = formData.get("groceryId") as string
        const name = formData.get("name") as string
        const category = formData.get("category") as string
        const unit = formData.get("unit") as string
        const price = formData.get("price") as string
        const file = formData.get("image") as Blob | null
        let imageUrl
        if(file){
            imageUrl = await uploadOnCloudinary(file)
        }
        const grocery = await Grocery.findByIdAndUpdate(groceryId,{
            name:name,
            category:category,
            unit:unit,
            price:price,
            image:imageUrl
        })
        return NextResponse.json(
            grocery,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`edit grocery error ${error}`},
            {status:500}
        )
    }
}