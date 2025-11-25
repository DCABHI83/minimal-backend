import mongoose, { mongo } from "mongoose";

const categorySchema = new mongoose.Schema({
    Categoryname:{
        type:String,
        trim:true,
        unique:true
    },
    description:{
        type:String
    }

},{timestamps:true})


const Category = mongoose.model("Category",categorySchema)

export default Category