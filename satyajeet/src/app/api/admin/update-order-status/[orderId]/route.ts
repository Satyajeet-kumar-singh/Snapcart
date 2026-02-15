import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import EmitEventHandler from "../../../../../../lib/EmitEventHandler";

export async function POST(req:NextRequest,context: { params: Promise<{ orderId: string; }>;}){
    try {
        await connectDB()
        const {orderId} = await context.params
        const {status} = await req.json()       
        const order = await Order.findById(orderId).populate("user")
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }
        order.status = status
        let deliveryboysPayload:any = []
        if(status === "out of delivery" && !order.assignment){
            const {latitude,longitude} = order.address
            const nearByDeliveryBoys = await User.find({role: "deliveryBoy",
                location: {
                    $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)],
                    },
                    $maxDistance: 10000,
                    },
                },
            });
            const nearById = nearByDeliveryBoys.map((b)=>b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo:{$in:nearById},
                status:{$nin:["broadcasted","completed"]}
            }).distinct("assignedTo")
            const busyIdSet = new Set(busyIds.map((b)=>String(b)))
            const availableDeliveryBoys = nearByDeliveryBoys.filter((b)=>!busyIdSet.has(String(b._id)))
            const candidates = availableDeliveryBoys.map((b)=>b._id)

            if(candidates.length === 0){
                await order.save()

                await EmitEventHandler('order-status-update',{orderId:order._id,status:order.status})

                return NextResponse.json(
                    {message:"There is no delivery boys"},
                    {status:200}
                )
            }
            const deliveryAssignment = await DeliveryAssignment.create({
                order:order._id,
                brodcastedTo:candidates,
                status:"brodcasted"
            })

            await deliveryAssignment.populate("order")
            for(const boyId of candidates){
                const boy = await User.findById(boyId)
                if(boy.socketId){
                    await EmitEventHandler("new-assignment",deliveryAssignment,boy.socketId)
                }
            }

            order.assignment = deliveryAssignment._id,
            deliveryboysPayload = availableDeliveryBoys.map((b)=>({
                id:b._id,
                name:b.name,
                mobile:b.mobile,
                latitude:b.location.coordinates[1],
                longitude:b.location.coordinates[0]
            }))
            await deliveryAssignment.populate("order")
        }
        await order.save()
        await order.populate("user")

        await EmitEventHandler('order-status-update',{orderId:order._id,status:order.status})

        return NextResponse.json({
            assignment:order.assignment?._id,
            availableBoys:deliveryboysPayload
        },{status:200})
    } catch (error) {
        return NextResponse.json(
            {message:`update-status error ${error}`},
            {status:500}
        )
    }
}