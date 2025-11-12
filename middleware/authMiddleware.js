import jwt from 'jsonwebtoken'

export const verifytoken = async(req,res,next)=>{
try {
    const authHeader = req.headers.authorization
    // console.log(authHeader)
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"token not sent"})
    }
    
    const token = authHeader.split(" ")[1]
    // console.log(`token recived ${token}`)
    if(!token){
        return res.status(401).json({message:"token not recieved"})
    }
    const verified = jwt.verify(token,process.env.SECRET_KEY)
    // console.log(verified)
     req.user = verified
    if(!verified){
        return res.status(401).json({message:"unauthorized access"})
    }
    next()
} catch (error) {
    console.error(error.message)
    return res.status(500).json({message:"token expired"})
}

}