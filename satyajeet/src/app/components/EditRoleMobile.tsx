"use client"
import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { ArrowRight, Bike, User, UserCog } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

function EditRoleMobile() {
  const[roles,setRoles] = useState([
    {id:"admin",label:"Admin",icon:UserCog},
    {id:"user",label:"User",icon:User},
    {id:"deliveryBoy",label:"Delivery Boy",icon:Bike}
  ])
  const[selectedRole,setselectedRole] = useState("")
  const[mobile,setMobile] = useState("")
  const router = useRouter()
  const {update} = useSession()

  const handleEdit=async()=>{
    try {
      const res = await axios.post(`/api/user/edit-role-mobile`,{role:selectedRole,mobile})
      await update({role:selectedRole})
      router.push("/")
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }

  // useEffect(()=>{
  //   const checkForAdmin=async()=>{
  //     try {
  //       const result = await axios.get(`/api/check-for-admin`)
  //       console.log("check for admin",result)
  //       if(result.data.adminExist){
  //         setRoles(prev=>prev.filter((r)=>r.id !== "admin"))
  //       }
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  //   checkForAdmin()
  // },[])
  
  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
        <motion.h1
        initial={{
          opacity:0,
          y:-20
        }}
        animate={{
          opacity:1,
          y:0
        }}
        transition={{
          duration:0.6
        }}
        className="text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8">
          Select Your Role
        </motion.h1>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
          {
            roles.map((role)=>{
              const Icon = role.icon
              const isselected = selectedRole == role.id
              return (
                <motion.div key={role.id} onClick={()=>{setselectedRole(role.id)}} whileTap={{scale:0.5}} className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 transition-all
                ${isselected ? "bg-green-100 border-green-600 shadow-lg" : "border-gray-300 bg-white hover:border-green-400"}`}>
                  <Icon/>
                  <span>{role.label}</span>
                </motion.div>
              )
            })
          }
        </div>
        <motion.div
        initial={{
          opacity:0
        }}
        animate={{
          opacity:1
        }}
        transition={{
          delay:0.5,
          duration:0.6
        }}
        className="flex flex-col items-center mt-10">
          <label htmlFor="mobile" className='textgray-700 font-medium mb-2'>Enter Youe Mobile No.</label>
          <input type="tel" id='mobile' className='w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-300
          focus:ring-2 focus:ring-green-300 focus:outline-none text-gray-800' placeholder="eg. 7461249610"
          value={mobile} onChange={(e)=>{setMobile(e.target.value)}}/>
        </motion.div>
        <motion.button
        initial={{
          opacity:0,
          y:20
        }}
        animate={{
          opacity:1,
          y:0
        }}
        transition={{
          delay:0.7
        }}
        onClick={()=>{handleEdit()}}
        className={`inline-flex items-center justify-center gap-2 mt-5 font-semibold py-3 px-5 w-40 rounded-xl shadow-md transition-all duration-200
        ${selectedRole && mobile.length === 10 ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 text-black cursor-not-allowed"}`}>
          Next <ArrowRight className='w-4 h-5'/>
        </motion.button>
    </div>
  )
}

export default EditRoleMobile
