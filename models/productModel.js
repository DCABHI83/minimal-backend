import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String
    },
    stock:{
        type:Number,
        required:true,
        default:0
    },
    image:{
        type:String
    }
},{timestamps:true})


const Product = mongoose.model("Product",productSchema)

export default Product