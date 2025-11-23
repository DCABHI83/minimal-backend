import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { verifytoken } from '../middleware/authMiddleware.js'
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
  const accessToken = jwt.sign({id:user._id,email:user.email},process.env.SECRET_KEY,{expiresIn:process.env.EXPIRES_IN})
  const refreshToken = jwt.sign({id:user._id,email:user.email},process.env.REFRESH_KEY,{expiresIn:process.env.REFRESH_EXPIRY})
  res.cookie("refreshToken",refreshToken,{
    httpOnly:true,
    sameSite:"strict",
   secure: process.env.NODE_ENV === "production",
    maxAge:7*24*60*60*1000
  })
   return res.status(200).json({message:"USer logged in successfully",accessToken})
 } catch (error) {
    return res.status(404).json({message:"something went wrong"})
 }
})

//profile

router.get('/profile',verifytoken,async(req,res)=>{
   try {
    const user = await User.findOne({email:req.user.email}).select("-password")
   if(user){
    return res.status(200).json({user})
   }
     return res.status(401).json({message:"Unauthorized Access"})
   } catch (error) {
    return res.status(500).json({message:error.message})
   }
})


//refreshToken

router.get('/refresh',async(req,res)=>{
 try {
   const refreshToken = req.cookies.refreshToken
   
   if (!refreshToken) {
  return res.status(401).json({ message: "No refresh token found" })
}
   const verifyToken = jwt.verify(refreshToken,process.env.REFRESH_KEY)
 
  
   const user = await User.findOne({_id:verifyToken.id})

   if(!user){
    return res.status(401).json({message:"User not Found"})
   }

   const accessToken = jwt.sign({_id:user._id,email:user.email},process.env.SECRET_KEY,{expiresIn:process.env.EXPIRES_IN})
   return res.status(200).json({token:accessToken})
 
 } catch (error) {
return res.status(403).json({ message: "Invalid or expired refresh token" })

 }
})



//logout

router.post('/logout',(req,res)=>{
  res.clearCookie('refreshToken')
  res.clearCookie('accessToken')
  return res.status(200).json({mesage:"User logged out successfully"})
})

export default router