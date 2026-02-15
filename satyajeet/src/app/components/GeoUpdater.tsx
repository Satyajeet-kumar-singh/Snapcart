"use client"
import React, { useEffect } from 'react'
import { getSocket } from '../../../lib/socket'

function GeoUpdater({userId}:{userId:string}) {
 let socket = getSocket()
 socket.emit("identity",userId)
 useEffect(()=>{
    if(!userId) return
    if(!navigator.geolocation) return

    const watcher = navigator.geolocation.watchPosition((pos)=>{
        const lat = pos.coords.latitude
        const long = pos.coords.longitude
        socket.emit("update-location",{
            userId,
            latitude:lat,
            longitude:long
        })
    },
        (err) => {
          console.log("location error", err);
        },
        { enableHighAccuracy:true})

    return ()=>navigator.geolocation.clearWatch(watcher)
 },[userId])
  return null
}

export default GeoUpdater
