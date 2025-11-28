import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinaryconfig.js";
import multer from "multer";




const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params : async(req,file)=>{
        return {
            folder : "products",
             allowed_formats: ["jpg", "jpeg", "png"], 
      transformation: [{ width: 800, height: 800, crop: "limit" }],
        }
    }
})

const uploadcloud = multer({storage})

export default uploadcloud