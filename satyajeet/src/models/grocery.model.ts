import mongoose from "mongoose";

export interface IGrocery { 
    _id?: mongoose.Types.ObjectId,
    name: string,
    category: string,
    price: string,
    unit: string,
    image: string,
    createdAt?: Date,
    updatedAt?: Date
}

const grocerySchema = new mongoose.Schema({
    name: {type:String,required:true},
    category: {type:String,enum:["Fruits & Vegetables","Dairy & Eggs","Rice, Atta & Grains","Snacks & Biscuits","Spices & masalas","Beverages & Drinks","Personal Care","Household & Essentials","Instant & Packaged Food","Baby & Pet Care"],required:true},
    price: {type:String,required:true},
    unit: {type:String,enum:["kg","g","litre","piece","pack"],required:true},
    image: {type:String,required:true}
},{timestamps:true})

const Grocery = mongoose.models.Grocery || mongoose.model("Grocery",grocerySchema)
export default Grocery