import { NextRequest, NextResponse } from "next/server"
import { auth } from '@/auth'
import User from "@/models/user.model"

export async function GET(req:NextRequest) {
    try {
        const session = await auth()
        if(!session || !session?.user){
            return NextResponse.json(
                {message:"user is not authenticated"},
                {status:400}
            )
        }
        const user = await User.findOne({email:session?.user.email}).select("-password")
        if(!user){
            return NextResponse.json(
                {message:"user not found"},
                {status:400}
            )
        }
        
        return NextResponse.json(
            user,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`get an error: ${error}`},
            {status:500}
        )
    }
}