import jwt from "jsonwebtoken"
import { Env } from "../config/env.config.js";


export const authProtection =async(req,res,next)=>{
   const reqHeader = req.headers.authorization;
   
   if(reqHeader.startsWith("Bearer"))
   {
     const token = reqHeader.split(" ")[1];
     if(token)
      {
        const decode = jwt.verify(token,Env.JWT_SECRET_KEY)
         req.user= decode;
        next();
      }
     
   }
   
}