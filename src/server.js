import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";


dotenv.config()

const app = express()

const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT

mongoose.connect(MONGO_URL)
.then(
    app.listen(PORT,()=>{
        console.log("App is running on PORT: ",PORT)
        console.log("DB connected successfuly")
    })
    
)