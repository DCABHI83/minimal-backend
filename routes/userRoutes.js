import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const router = express.Router()
//user creation
router.post('/signup',async(req,res)=>{
try {
    const {name,email,password} = req.body
    if(!email || !name || !password){
        return res.status(400).json({message:"All fields are required"})
    }
    const existingEmail = await  User.findOne({email})
    if(existingEmail){
        return res.status(400).json({message:"User already exists"})
    }
    const user = await User.create({name,email,password})
    return res.status(201).json({message:"User created successfully"})
} catch (error) {
   return  res.status(404).json({message:"Something went wrong",error})
}

})

//login

router.post('/login',async(req,res)=>{
 try {
    const {email,password} = req.body
    if(!email || !password){
        return res.status(400).json({message:"All fields are required"})
    }
   const user = await User.findOne({email})
   if(!user){
     return res.status(400).json({message:"User not found Please signup"})
   }
   const match = await bcrypt.compare(password,user.password)
   if(!match){
         return res.status(400).json({message:"Invalid credentials"})
   }
  const token = jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:process.env.EXPIRES_IN})
   return res.status(200).json({message:"USer logged in successfully",token})
 } catch (error) {
    return res.status(404).json({message:"something went wrong"})
 }
})

//profile

router.get('/profile',(req,res)=>{
    
})


export default router