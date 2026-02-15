import express from "express"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import axios from "axios"

dotenv.config()
const app = express()
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:process.env.NEXT_BASE_URL
    }
})

io.on("connection",(socket)=>{
    console.log("user connected",socket.id)

    socket.on("identity",async(userId)=>{
        console.log(userId)
        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{userId,socketId:socket.id})
    })

    socket.on('update-location',async({userId,latitude,longitude})=>{ 
        console.log("update-location",userId,latitude,longitude)
        const location = {
            type: "Point",
            coordinates: [longitude,latitude]
        }

        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`,{userId,location})

        io.emit("update-deliveryBoy-location",{userId,location})
    })

    socket.on("join-room",(roomId)=>{
        socket.join(roomId)
    })

    socket.on("send-message",async(message)=>{
        console.log("send-message",message)
        await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`,message)
        io.to(message.roomId).emit("send-message",message) 
    })

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id)
    })
})

app.post("/notify",(req,res)=>{
    const {event,data,socketId} = req.body
    if(socketId){
        io.to(socketId).emit(event,data)
    }else{
        io.emit(event,data)
    }

    res.status(200).json({"success":true})
})

server.listen(4000,()=>{
    console.log("server running at 4000")
})



