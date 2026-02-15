import axios from 'axios'
import React from 'react'

async function EmitEventHandler(event:string,data:any,socketId?:string) {
    try {
        await axios.post(`http://localhost:4000/notify`,{socketId,event,data})
    } catch (error) {
        console.log(error)
    }
}

export default EmitEventHandler
