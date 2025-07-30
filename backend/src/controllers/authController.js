import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Env } from "../config/env.config.js";
import { loginSchema, signinSchema } from "../validators/auth.js";
import mongoose from "mongoose";
import { reportSettingModel } from "../models/reportSettingModel.js";
import { calculateNextReportDate } from "../utils/helper.js";
export const createUser=async(req,res)=>{
  const session= await mongoose.startSession();
 try{
    await session.withTransaction(async()=>{
   
             const{name,email,password} = req.body; 
     
       if(!(name ||email ||password))  
         return res.status(404).json({message:"Please fill in all the fields."})
        const ifUserExists = await userModel.findOne({email});
        if(ifUserExists)
             return res.status(401).json({message: "USer already exists"});
       const hasedpassword = await bcrypt.hash(password,10);
       //generate token
      
       const user = await userModel.create({name,email,password:hasedpassword});
        
       if(user){
        const token = jwt.sign({id : user._id},Env.JWT_SECRET_KEY)
        if(token){
          

        const resportSetting = new reportSettingModel({
            userId : user._id,
            frequency : "Monthly",
            isEnabled : true,
            lastSentDate : null,
            nextReportDate : calculateNextReportDate()
        })
        
        await resportSetting.save(session);
         return res.status(200).json({user,token,message:"User created sucessfully."})
    }
       }
       else{
         return res.status(401).json({message:"User not created."})
       }
    })
     

 }
 catch(error){
              return res.status(500).json({message: error.message})
 }
 finally{
    await session.endSession();
 }
}

export const loginUser=async(req,res)=>{
 try{
  
       const{email,password} = (req.body); 
      
       if(!(email ||password))  
         return res.status(404).json({message:"Please fill in all the fields."})
        const userExists = await userModel.findOne({email});
        if(userExists)
        { 
              const isMatched =  bcrypt.compare(password,userExists.password)
               if(isMatched)
               {
                 const token =  jwt.sign({id : userExists._id},Env.JWT_SECRET_KEY);
                 if(token)
                 {
                   const reportSetting = await reportSettingModel.findOne(
                     {
                        userId: userExists._id,
                     },
                     { _id: 1, frequency: 1, isEnabled: 1 }
                  ).lean();

                    return res.status(200).json({user : userExists,token,reportSetting,message :"User login sucessfully."})
                 }
               }
               else{
                return res.status(404).json({message: "User Login unsucessfull"})
               }
        }
            
    

 }
 catch(error){
              return res.status(500).json({message: error.message})
 }
}