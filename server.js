import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import router from './routes/userRoutes.js'


dotenv.config()
const app = express()
app.use(express.json())


app.use((req,res,next)=>{
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use('/api',router)

const startServer = async()=>{
    
    try {
        await connectDb()
    app.listen(process.env.PORT,()=>{
        console.log(`the server is running on port ${process.env.PORT}`)
    })
    } catch (error) {
        console.log("Server failed to Start",error.message)
    }
}

startServer()
