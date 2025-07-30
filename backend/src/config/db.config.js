import mongoose from "mongoose";
import { Env } from "./env.config.js";
export const connectDB=async()=>{
  
   mongoose.connection.on("connected",(req,res)=>{
     console.log("Mongo DB connected")
   })
   mongoose.connection.on("error",(req,res)=>{
     console.log("Mongo DB connection Error")
   })
    await mongoose.connect(Env.MONGO_URI);
}

