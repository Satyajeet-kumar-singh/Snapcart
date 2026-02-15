import React from 'react'
import DeliveryBoyDashboard from './DeliveryBoyDashboard'
import connectDB from '../../../lib/db'
import { auth } from '@/auth'
import Order from '@/models/order.model'

async function DeliveryBoy() {
  await connectDB()
  const session = await auth()
  const deliveryBoyId = session?.user?.id
  const orders = await Order.find({
    assignedDeliveryBoy:deliveryBoyId,
    deliveryOtpVerificaion:true
  })

  const today = new Date().toLocaleDateString()
  const todayOrders = orders.filter((o)=> new Date(o.deliveredAt).toDateString() === today).length
  const todaysEarning = todayOrders * 40
  return (
    <>
     <DeliveryBoyDashboard earning={todaysEarning}/>
    </>
  )
}

export default DeliveryBoy
