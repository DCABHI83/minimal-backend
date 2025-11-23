import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    description:{
        type:String,
        required:true
    },
    categories:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Category'
    },
    stock:{
        type:Number,
        required:true,
        default:0,
        min:0
    },
    image:{
        type:[String]
    }
},{timestamps:true})


const Product = mongoose.model("Product",productSchema)

export default Product