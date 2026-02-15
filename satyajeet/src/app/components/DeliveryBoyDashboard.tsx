"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { getSocket } from '../../../lib/socket'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import LiveMap from './LiveMap'
import DeliveryChat from './DeliveryChat'
import { Loader } from 'lucide-react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

interface ILocation {
  latitude:number,
  longitude:number
}

function DeliveryBoyDashboard({earning}:{earning:number}) {
  const [assignments,setAssignments] = useState<any[]>([])
  const {userData} = useSelector((state:RootState)=>state.user)
  const [activeOrder,setActiveOrder] = useState<any>(null)
  const [userLocation,setUserLocation] = useState<ILocation>({latitude:0,longitude:0})
  const [deliveryBoyLocation,setDeliveryBoyLocation] = useState<ILocation>({latitude:0,longitude:0})
  const [showOtpBox,setShowOtpBox] = useState(false)
  const [otp,setOtp] = useState("")
  const [otpError,setOtpError] = useState("")
  const [sendOtpLoading,setSendOtpLoading] = useState(false)
  const [verifyOtpLoading,setVerifyOtpLoading] = useState(false)

  const fetchAssignments=async()=>{
      try {
        const result = await axios.get(`/api/delivery/get-assignments`)
        console.log("deliveryBoyDashboard",result)
        setAssignments(result.data)
      } catch (error) {
        console.log(error)
      }
    }

  useEffect(()=>{
    const socket = getSocket()
    if(!userData?._id) return
    if(!navigator.geolocation) return
    const watcher = navigator.geolocation.watchPosition((pos)=>{
      const lat = pos.coords.latitude
      const long = pos.coords.longitude
      setDeliveryBoyLocation({
        latitude:lat,
        longitude:long
      })
      socket.emit("update-location",{
        userId:userData._id,
        latitude:lat,
        longitude:long
      })
    },(err)=>{
      console.log(err)
    },{enableHighAccuracy:true})

    return ()=>navigator.geolocation.clearWatch(watcher)
  },[userData?._id])

  useEffect(():any=>{
    const socket = getSocket()
    socket.on("new-assignment",(deliveryAssignment)=>{
      setAssignments((prev)=>[...prev,deliveryAssignment])
    })
    return ()=>socket.off("new-assignment")
  },[])

  const handleAccept=async(id:string)=>{
    try {
      const result = await axios.get(`/api/delivery/assignment/${id}/accept-assignment`)
      console.log("accept-assignment",result)
      await fetchCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }  

    const fetchCurrentOrder=async()=>{
      try {
        const result = await axios.get(`/api/delivery/current-order`)
        console.log("fetchCurrentOrder",result)
        if(result.data.active){
          setActiveOrder(result.data.assignment)
          setUserLocation({
            latitude:result.data.assignment.order.address.latitude,
            longitude:result.data.assignment.order.address.longitude
          })
        }
      } catch (error) {
        console.log(error)
      }
    }

    useEffect(():any=>{
      const socket = getSocket()
      socket.on("update-deliveryBoy-location",({userId,location})=>{
        setDeliveryBoyLocation({
          latitude:location.coordinates[1],
          longitude:location.coordinates[0]
        })
      })
      return ()=>socket.off("update-deliveryBoy-location")
    },[])

    useEffect(()=>{
    fetchAssignments()
    fetchCurrentOrder()
  },[userData])

  const sendOtp=async()=>{
    try {
      setSendOtpLoading(true)
      const result = await axios.post(`/api/delivery/otp/send`,{orderId:activeOrder.order._id})
      console.log("send otp",result)
      setShowOtpBox(true)
      setSendOtpLoading(false)
    } catch (error) {
      console.log(error)
      setSendOtpLoading(false)
    }
  }

   const verifyOtp=async()=>{
    try {
      setVerifyOtpLoading(true)
      const result = await axios.post(`/api/delivery/otp/verify`,{orderId:activeOrder.order._id,otp})
      console.log("send otp",result)
      setActiveOrder(null)
      setVerifyOtpLoading(false)
      await fetchCurrentOrder()
      window.location.reload()
    } catch (error) {
      console.log(error)
      setOtpError("otp verification error")
      setVerifyOtpLoading(false)
    }
  }

  if(!activeOrder && assignments.length === 0){
    const todayEarning = [
      {
        name:"Today",
        earning,
        deliveries:earning/40
      }
    ]
    return (
      <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-white to bg-green-50 p-6'>
        <div className='max-wmd w-full text-center'>
          <h2 className='text-2xl font-bold text-gray-800'>No Active Deliveries 🚒</h2>
          <p className='text-gray-500 mb-5'>Stay online to recieve new orders</p>

          <div className='bg-white border rounded-xl shadow-xl p-6'>
            <h2 className='font-medium text-green-700 mb-2'>Today's Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={todayEarning}>
                    <YAxis/>
                    <Tooltip/>
                    <Legend/>
                    <Bar dataKey="earning" name="Earnings(₹)"/>
                    <Bar dataKey="deliveries" name="Deliveries"/>
                  </BarChart>
               </ResponsiveContainer>

               <p className='mt-4 text-lg font-bold text-green-700'>{earning || 0} Earned Today</p>
               <button onClick={()=>{window.location.reload()}} className='mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg'>
                Refresh earning
               </button>
          </div>
        </div>
      </div>
    )
  }

  if(activeOrder && userLocation){
    return (
      <div className='p-4 pt-30 min-h-screen bg-gray-50 relative z-0'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold text-green-700 mb-2'>Active Delivery</h1>
          <p className='text-gray-600 text-sm mb-4'>order #{activeOrder.order._id.slice(-6)}</p>

          <div className='rounded-xl border shadow-lg overflow-hidden mb-6'>
            <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation}/>
          </div>

            <DeliveryChat orderId={activeOrder.order._id} deliveryBoyId={userData?._id!}/>

          <div className='mt-6 bg-white rounded-xl border shadow p-6'>
            {!activeOrder.order.deliveryOtpVerificaion && !showOtpBox && (
              <button onClick={()=>{sendOtp()}} className='w-full py-4 flex items-center justify-center bg-green-600 text-white rounded-lg'>
              {sendOtpLoading ? <Loader size={16} className='animate-spin text-white'/> : "Mark as Delivered"}
            </button>
            )}
            {
              showOtpBox && 
              <div className='mt-4'>
                <input type="text" value={otp} onChange={(e)=>{setOtp(e.target.value)}} className='w-full py-3 border rounded-lg text-center' placeholder='Enter Otp' maxLength={4}/>
                <button onClick={()=>{verifyOtp()}} className='w-full mt-4 flex items-center justify-center bg-green-600 text-white py-3 rounded-lg'>
                  {verifyOtpLoading ? <Loader size={16} className='animate-spin text-white'/> : "Verify OTP"}</button>
                {otpError && <div className='text-red-600 mt-2'>{otpError}</div>}
              </div>
            }
            {activeOrder.order.deliveryOtpVerificaion && 
            <div className='text-green-700 text-center font-bold'>Delivery Completed!</div>}
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gray-50 p-4'>
      <div className='max-w-xl mx-auto'>
          <h2 className='text-3xl fnt-bold mt-30 mb-7.5'>Delivery Assignments</h2>
          {assignments.map((a)=>(
            <div key={a._id} className='p-5 bg-white rounde-xl shadow mb-4 border'>
              <p><b>Order Id </b> #{a?.order._id.slice(-6)}</p>
              <p className='text-gray-600'>{a.order.address.fullAddress}</p>

              <div className='flex gap-3 mt-4'>
                <button onClick={()=>{handleAccept(a._id)}} className='flex-1 bg-green-600 text-white py-2 rounded-lg'>Accept</button>
                <button className='flex-1 bg-red-600 text-white py-2 rounded-lg'>Reject</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard
