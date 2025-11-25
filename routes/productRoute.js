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
   
 
  
   const filter = {}

  if (category) {
  if (!mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }
  filter.categories = category;
}


   if(name){
      filter.name = {$regex:name,$options : "i"}
   }

   const product = await Product.find(filter).populate("categories")

   return res.status(200).json({message:"Product fetched successfully",product})
   
   
} catch (error) {
   return res.status(500).json({message:"internal server error",error:error.message})
}

})

//getsingleProduct

productRouter.get('/getsingleproduct/:id',async(req,res)=>{
  try {
   const {name,id} = req.params
   console.log(id)
     if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

   const product = await Product.findById(id).populate("categories")
   console.log(product)
   if(!product){
      return res.status(404).json({message:"product not found"})
   }

   return res.status(200).json({message:"product fetched successfully",product})

  } catch (error) {
   return res.status(500).json({message:"internal server error",error:error.message})
  }
   
})


//updatePtoduct

productRouter.put("/updateproduct/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const { name, price, stock, description, categories } = req.body;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate categories (if provided)
    if (categories) {
      if (!Array.isArray(categories)) {
        return res.status(400).json({ message: "Categories must be an array" });
      }

      const found = await Category.find({ _id: { $in: categories } });
      if (found.length !== categories.length) {
        return res.status(400).json({ message: "Some category IDs do not exist" });
      }

      product.categories = categories; // Assign valid categories
    }

    // Update only provided fields
    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (description) product.description = description;

    // Save updates
    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});

productRouter.delete('/deleteproduct/:id',async(req,res)=>{
  try {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
       return res.status(400).json({message:"invalid id"})
    }
    const product = await Product.findById(id)
    if(!product){
       return res.status(404).json({message:"Product not found"})
    }
   await Product.findByIdAndDelete(id)
 
   return res.status(200).json({message:"product is deleted successfully"})
  } catch (error) {
   return res.status(500).json({message:"internal server error",error:error.message})
  }

})