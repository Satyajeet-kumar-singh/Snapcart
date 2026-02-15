import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db"
import { auth } from '@/auth'
import User from '@/models/user.model'

export async function POST(req:NextRequest){
    try {
        await connectDB()
        const {role,mobile} = await req.json()
        const session = await auth()
        const user = await User.findOneAndUpdate({email:session?.user?.email},{role,mobile},{new:true})//update wla milega vran old milta h 
        if(!user){
            return NextResponse.json(
                {message:'user not found'},
                {status:400}
            )
        }

        return NextResponse.json(
            user,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`edit role and mobile error ${error}`},
            {status:500}
        )
    }
}