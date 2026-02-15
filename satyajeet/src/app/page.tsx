import connectDB from '../../lib/db'
import { auth } from '@/auth'
import User from '@/models/user.model'
import { redirect } from 'next/navigation'
import EditRoleMobile from './components/EditRoleMobile'
import Nav from './components/Nav'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import DeliveryBoy from './components/DeliveryBoy'
import GeoUpdater from './components/GeoUpdater'
import Grocery, { IGrocery } from '@/models/grocery.model'
import Footer from './components/Footer'


export default async function Home(props:{searchParams:Promise<{q:string}>}) {
    const searchParams = await props.searchParams
    await connectDB()
    const session = await auth()
    console.log("home",session)

    const user = await User.findById(session?.user?.id).lean();
    if(!user){
      redirect("/login")
    }
    console.log("index page",user)
    const inComplete = !user.mobile || !user.role || (!user.mobile && user.role === "user")
    if(inComplete){
      return <EditRoleMobile/>
    }

    const plainUser = JSON.parse(JSON.stringify(user))

    let groceryList:IGrocery[] = []

    if(user.role === "user"){
      if(searchParams.q){
        groceryList = await Grocery.find({
          $or:[
            {name:{$regex:searchParams?.q || "",$options:"i"}},
            {category:{$regex:searchParams?.q || "",$options:"i"}},
          ]
        })
      }
    }else {
      groceryList = await Grocery.find({})
    }
  
  return (
    <div>
     <Nav user={plainUser}/>
     <GeoUpdater userId={plainUser._id}/>
     {user.role === "user" ? <UserDashboard groceryList={groceryList}/> : user.role === "admin" ? <AdminDashboard/> : <DeliveryBoy/>}
     <Footer/>
    </div>
  )
}
