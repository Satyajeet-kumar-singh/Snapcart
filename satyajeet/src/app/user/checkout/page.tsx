"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building,
  CreditCard,
  CreditCardIcon,
  Home,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import dynamic from "next/dynamic";
const CheckoutMap = dynamic(()=>import("@/app/components/CheckoutMap"),{ssr:false})


function Checkout() {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const { subTotal,deliveryFee,finalTotal,cartData } = useSelector((state: RootState) => state.cart);
  const [searchQuery,setSearchQuery] = useState("")
  const [paymentMethod,setPaymentMethod] = useState<"cod" | "online">("cod")
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          console.log("location error", err.message);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setAddress((prev) => ({
        ...prev,
        fullName: userData.name || "",
        mobile: userData.mobile || "",
      }));
    }
  }, [userData]);


  useEffect(()=>{
    const fetchAddress=async()=>{
      if(!position) return null;
      try {
        const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json&accept-language=en`)
        console.log("result",result)
        setAddress((prev)=>({
          ...prev,
          city:result.data.address.city_district ?? "",
          state:result.data.address.city ?? "",
          pincode:result.data.address.postcode ?? "",
          fullAddress:result.data.display_name ?? ""
        }))
      } catch (error) {
        console.log(error)
      }
    }
    fetchAddress()
  },[position])

  const handleSearchQuery=async()=>{
    const {OpenStreetMapProvider }= await import("leaflet-geosearch")
    const provider = new OpenStreetMapProvider()
    const result = await provider.search({query:searchQuery})
    console.log("geosearch",result)
    if(result.length > 0){
      const {x,y} = result[0]
      setPosition([y,x])
    }
  }

  const handleCurrentPosition=()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos)=>{
        const {latitude,longitude} = pos.coords
        setPosition([latitude,longitude])
      },(err)=>{
        console.log("location error",err.message)
      },{enableHighAccuracy:false,timeout:10000,maximumAge:0})
    }
  }

  //function for cash on delivery
  const handleCod=async()=>{
    if(!position) return null;
    try {
      const result = await axios.post(`/api/user/order`,{
        userId:userData?._id,
        items:cartData.map((item)=>(
          {
            grocery:item._id,
            name:item.name,
            price:item.price,
            unit:item.unit,
            quantity:item.quantity,
            image:item.image
          }
        )),
        totalAmount:finalTotal,
        address:{
          fullname:address.fullName,
          mobile:address.mobile,
          city:address.city,
          state:address.state,
          fullAddress:address.fullAddress,
          pincode:address.pincode,
          latitude:position[0],
          longitude:position[1]
        },
        paymentMethod
      })

      console.log("CHECKOUT",result.data)

      router.push("/user/order-success")
    } catch (error) {
      console.log(error)
    }
  }

  const handleOnlinePayment=async()=>{
    if(!position) return null;
    try {
      const result = await axios.post(`/api/user/payment`,{
        userId:userData?._id,
        items:cartData.map((item)=>(
          {
            grocery:item._id,
            name:item.name,
            price:item.price,
            unit:item.unit,
            quantity:item.quantity,
            image:item.image
          }
        )),
        totalAmount:finalTotal,
        address:{
          fullname:address.fullName,
          mobile:address.mobile,
          city:address.city,
          state:address.state,
          fullAddress:address.fullAddress,
          pincode:address.pincode,
          latitude:position[0],
          longitude:position[1]
        },
        paymentMethod
      })
      console.log("stripe redirect page",result)
      window.location.href = result.data.url
    } catch (error) {
      console.log(error)
    }
  }

  console.log(address);
  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          router.push("/user/cart");
        }}
        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold"
      >
        <ArrowLeft size={16} />
        <span>Back to cart</span>
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
      >
        Checkout
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-green-700" />
            Delivery address
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-green-300"
                size={18}
              />
              <input
                type="text"
                value={address?.fullName}
                readOnly
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="relative">
              <Phone
                className="absolute left-3 top-3 text-green-300"
                size={18}
              />
              <input
                type="text"
                value={address?.mobile}
                readOnly
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="relative">
              <Home
                className="absolute left-3 top-3 text-green-300"
                size={18}
              />
              <input
                type="text"
                value={address.fullAddress}
                onChange={(e) => {
                  setAddress((prev) => ({
                    ...prev,
                    fullAddress: e.target.value,
                  }));
                }}
                placeholder="full address"
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>
            <div className=" grid grid-cols-3 gap-3">
              <div className="relative">
                <Building
                  className="absolute left-3 top-3 text-green-300"
                  size={18}
                />
                <input
                  type="text"
                  value={address?.city}
                  onChange={(e) => {
                    setAddress((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  placeholder="city"
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>
              <div className="relative">
                <Navigation
                  className="absolute left-3 top-3 text-green-300"
                  size={18}
                />
                <input
                  type="text"
                  value={address?.state}
                  onChange={(e) => {
                    setAddress((prev) => ({ ...prev, state: e.target.value }));
                  }}
                  placeholder="state"
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-green-300"
                  size={18}
                />
                <input
                  type="text"
                  value={address?.pincode}
                  onChange={(e) => {
                    setAddress((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }));
                  }}
                  placeholder="pincode"
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="search city or area..."
                value={searchQuery}
                onChange={(e)=>{setSearchQuery(e.target.value)}}
                className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button onClick={()=>{handleSearchQuery()}} className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700 transition-all font-medium">
                Search
              </button>
            </div>

            <div className="relative mt-6 h-[330px] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              {position && 
                <CheckoutMap position={position} setPosition={setPosition}/>
              }
              <motion.button
              onClick={()=>{handleCurrentPosition()}}
              whileTap={{scale:0.93}}
              className='absolute bottom-4 right-4 bg-green-400 text-white shadow-lg rounded-full p-3 hover:bg-green-600 transition-all flex items-center justify-center z-999'>
                <LocateFixed size={22}/>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
        initial={{opacity:0,x:20}}
        animate={{opacity:1,x:0}}
        transition={{duration:0.3}}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
           <CreditCard className="text-gray600"/> Payment Method</h2>
           <div className="space-y-4 mb-6">
              <button
              onClick={()=>{setPaymentMethod("online")}} 
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "online" ? "border-green-600 bg-green-50 shadow-sm" : "hover:bg-gray-50"}`}>
                  <CreditCardIcon/>
                  <span>Pay Online (stripe)</span>
              </button>
              <button 
              onClick={()=>{setPaymentMethod("cod")}}
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "cod" ? "border-green-600 bg-green-50 shadow-sm" : "hover:bg-gray-50"}`}>
                  <CreditCardIcon/>
                  <span>Cash on delivery</span>
              </button>
           </div>
           
           <div className="border-t pt-4 text-gray-700 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="font-semibold text-green-400">₹{subTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Delivery Fee</span>
              <span className="font-semibold text-green-400">₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t p-1">
              <span >Final Total</span>
              <span className="text-green-400">₹{finalTotal}</span>
            </div>
           </div>
           <motion.button
           whileTap={{scale:0.93}}
           className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-semibold"
           onClick={()=>{
            if(paymentMethod === "cod"){
              handleCod()
            }else{
              handleOnlinePayment()
            }
           }}>
            {paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
           </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;

