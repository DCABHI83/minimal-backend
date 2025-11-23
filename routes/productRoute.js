import express, { json } from 'express'
import Category from '../models/categoryModel.js'
import Product from '../models/productModel.js'
import mongoose, { mongo } from 'mongoose'
import { verifytoken } from '../middleware/authMiddleware.js'

const productRouter = express.Router()

//Category
productRouter.post('/categories',async(req,res)=>{
   try {
    const {name,description} = req.body
 
   const category =await Category.findOne({name})
    console.log(category)
    if(category){
     return res.status(409).json({message:"category already exist"})
    }

    if(!name || !description){
     return res.status(400).json({message:"All fieds are required"})
    }
   
 const categories = await Category.create({name,description})
 console.log(categories)
 return res.status(201).json({message:"category created successfully",categories})
   } catch (error) {
    return res.status(500).json({message:error.message})
   }
})


//createProduct
productRouter.post('/addproduct',async(req,res)=>{
  try {
    const {name,price,categories,stock,description} = req.body
    if(typeof categories === "string"){
      categories = [categories]
    }

    if(!Array.isArray(categories) || categories.length === 0 ){
    return res.status(400).json({ message: "At least one category is required" });
    }
 
    if(!name || price == null || stock == null || !description){
       return res.status(400).json({message:"All fields are required"})
    }

  const product = await Product.findOne({name})
 if(product){
    return res.status(400).json({message:"product already exists"})
 }
    
 let validCategories = [];
 let invalidCategories = [];
 let duplicateCategories = [];
 
 
 const normalizedCategories = categories.map((id)=> id.toString().trim())
 const seen = new Set()
 for(let id of normalizedCategories){
    if(seen.has(id)){
       duplicateCategories.push(id)
       continue
    }
 
    seen.add(id)
 
    if(!mongoose.Types.ObjectId.isValid(id)){
    invalidCategories.push(id)
    continue
 }
 
 const exists = await Category.findById(id)
 if(!exists){
    invalidCategories.push(id)
    continue
 }
 
 validCategories.push(id)
 
 }
 
 
 if(validCategories.length === 0 || invalidCategories.length >  0 || duplicateCategories.length > 0){
    return res.status(400).json({message:"cant be added it is either invalid or duplicate"})
 }
 

 const newProduct = await Product.create({name,price,description,categories:validCategories,stock})
 return res.status(201).json({message:"product created successfully",newProduct})
 
 
  } catch (error) {
   return res.status(500).json({message:"internal server error",error:error.message})
  }


})

export default productRouter


//getallProducts

productRouter.get('/getallproducts',async(req,res)=>{
try {
   const {name,category} = req.query
   
   console.log(name,category)
   
   if(!category){
      return res.status(400).json({message:"invalid category"})
   }

   const filter = {}

   if(category) {
      filter.categories = category
   }

   if(name){
      filter.name = {$regex:name,$options : "i"}
   }

   const product = await Product.find(filter)

   return res.status(200).json({message:"Product fetched successfully",product})
   
   
} catch (error) {
   return res.status(500).json({message:"internal server error",error:error.message})
}

})
