import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Env } from "../config/env.config.js";
import { loginSchema, signinSchema } from "../validators/auth.js";
import mongoose from "mongoose";
import { reportSettingModel } from "../models/reportSettingModel.js";
import { calculateNextOccurence, calculateNextReportDate } from "../utils/helper.js";
import { createTransactionSchema } from "../validators/transaction.js";
import { transactionModel } from "../models/transactionModel.js";
import { bulkDeleteTransactionSchema } from "../validators/transaction.js";
import { tr } from "zod/v4/locales";
import { response } from "express";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { createUser } from "./authController.js";
import { createUserContent } from "@google/genai";
import { receiptPrompt } from "../utils/prompt.js";
import axios from "axios";
import { convertToDollar } from "../utils/formatCurrency.js";
export const createTransaction=async(req,res)=>{
    const session= await mongoose.startSession();
 try{
   // await session.withTransaction(async()=>{
        const userId  =req.user?.id;
       
        const{isRecurring,recurringInterval}=req.body;
          let nextrecurringDate='';
       let calculateDate='';
        const currentDate = new Date();
        if(req.body.isRecurring && req.body.recurringInterval)
        {
           
         calculateDate = calculateNextOccurence(req.body.date,req.body.recurringInterval)
         //console.log("Next Date",calculateDate)
        }
       // console.log(calculateDate)
        nextrecurringDate = calculateDate < currentDate ?  calculateNextOccurence(currentDate,recurringInterval) : calculateDate;
        console.log("NextDate",nextrecurringDate)
        const transaction = await transactionModel.create({
        ... req.body,
       
        userId,
        amount : convertToDollar(req.body.amount),
         isRecurring:isRecurring,
        nextrecurringDate,
        lastprocessed : null,

       })
       //console.log("TRanaction Savd",transaction)
       return res.status(200).json({transaction,message:"Transaction created sucessfully."})
    //})
 }
 catch(error){
              return res.status(500).json({message: error.message})
 }
 finally{
   // await session.endSession();
 }
}

export const getAllTransactions=async(req,res)=>{
  try{
      const userId = req.user?.id;
      const{keyword,type,recurringStatus,pageSize,pageNumber}=req.query;
    
        const pagination = {
            pageSize : pageSize || 20,
            pageNumber : pageNumber || 1 

        }
        const filterConditions = {userId};
        if(keyword)
        {
         filterConditions.$or =[
            {title : {$regex:keyword,$options :"i"}},
             {category : {$regex:keyword,$options :"i"}},
         ]
         
        }
        if(type)
        {
         filterConditions.type = type;
        }
        if(recurringStatus)
        {
         if(recurringStatus === "RECURRING")
         {
            filterConditions.isRecurring = true;
         }
         if(recurringStatus === "NON_RECURRING")
         {
            filterConditions.isRecurring = false;
         }
         
        }

        const skip = (pageNumber - 1) * pageSize ;
        
         const transactions = await transactionModel.find(filterConditions).skip(skip).limit(pageSize).sort({createdAt : -1});
       
         const totalCount = await transactionModel.countDocuments(filterConditions);
        
           const totalPages =Math.ceil(totalCount / pageSize);
      if(transactions)
      {
        return res.status(200).json({transactions,pagination:{pageSize,
         pageNumber,totalCount,totalPages},message:"All transactions fetched sucessfully."})
      }
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}

export const getTransactionByID=async(req,res)=>{
  try{
      const userId = req.user?.id;
      const transactionId = req.params.id;
      
      if(!transactionId)
          return res.status(404).json({message : "Transaction ID not found"})
       const transactionById = await transactionModel.findOne({_id : transactionId});
       if(transactionById)
       {
            return res.status(200).json({transaction : transactionById,message : "Transaction fetched for ID sucessfully"})
       }
       else{
          return res.status(404).json({message : "Transaction not found"})
       }
    
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}

export const duplicateTransaction=async(req,res)=>{
  try{
   
      const userId = req.user?.id;
     
      const transactionId = req.params.id;
      if(!transactionId)
          return res.status(404).json({message : "Transaction ID not found"})
       const transactionById = await transactionModel.findOne({_id : transactionId});
       if(transactionById)
       {
          // Convert to object to manipulate
            const transactionData = transactionById.toObject();

            // Remove or override fields
            delete transactionData._id;
            delete transactionData.createdAt;
            delete transactionData.updatedAt;
         const duplicate = await transactionModel.create({
            ...transactionData,
           
            title : `Duplicate Transaction ID : ${transactionId}`,
            description : transactionById.description ? `${tr.description} (Duplicate)` : "Duplicate Transaction",
            isRecurring :false,
            recurringInterval :undefined,
            nextrecurringDate:undefined,
            user: userId

         })
       
            return res.status(200).json({transaction : duplicate,message : "Transaction Duplicated sucessfully"})
       }
       else{
          return res.status(404).json({message : "Transaction not found"})
       }
    
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}

export const updateTransaction=async(req,res)=>{
  try{
      const userId = req.user?.id;
      const transactionId = req.params.id;
      if(!transactionId)
          return res.status(404).json({message : "Transaction ID not found"})
       const transactionById = await transactionModel.findByIdAndUpdate({_id : transactionId});
       if(transactionById)
       {
          const{title,type,amount,description,category,recieptUrl,date,isRecurring,recurringInterval,paymentMethod} = req.body; 
          const now = new Date(); 
          let nextrecurringDate = '';
          let calculateDate='';
             const newisRecurring = isRecurring ?? transactionById.isRecurring;
           const newdate = date !== undefined ? new Date(date) : transactionById.date;
           const  newrecurringInterval = recurringInterval ?? transactionById.recurringInterval;
           if(newisRecurring && newrecurringInterval)
            {
             calculateDate = calculateNextOccurence(newdate,newrecurringInterval)
            }
            nextrecurringDate = calculateDate < now ?  calculateNextOccurence(now,newrecurringInterval) : calculateDate;
             transactionById.set({
                title,
                description,
                category,
                type,
                paymentMethod,
                 amount : convertToDollar(req.body.amount),
                isRecurring : newisRecurring,
                recurringInterval : newrecurringInterval,
                nextrecurringDate : nextrecurringDate
             })  
              await transactionById.save();
            return res.status(200).json({transaction : transactionById,message : "Transaction Updated sucessfully"})
       }
       else{
          return res.status(404).json({message : "Transaction not found"})
       }
    
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}

export const deleteTransaction=async(req,res)=>{
  try{
      const userId = req.user?.id;
      const transactionId = req.params.id;
      
      if(!transactionId)
          return res.status(404).json({message : "Transaction ID not found"})
       const transactionById = await transactionModel.findByIdAndDelete({_id : transactionId});
       if(transactionById)
       {
           
            return res.status(200).json({message : "Transaction Deleted sucessfully"})
       }
       else{
          return res.status(404).json({message : "Transaction not found"})
       }
    
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}

export const bulkdeleteTransaction=async(req,res)=>{
  try{
      const userId = req.user?.id;
     
      const {transactionIds} = bulkDeleteTransactionSchema.parse(req.body);
     
       const result = await transactionModel.deleteMany({_id : {$in : transactionIds}, userId});
       if(result)
       {
            if(result.deletedCount === 0)
              return res.status(200).json({message : "Transaction Deletion unsucessfull"})
           return res.status(200).json({sucess:true,deletedCount :result.deletedCount, }) 
       }
       else{
          return res.status(404).json({message : "Transaction not found"})
       }
    
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}
export const bulkcreateTransaction = async (req,res) => {
    const userId = req.user?.id;
    const {transactions} =  req.body;
   
  try {
    const bulkOps = transactions.map((tx) => ({
    
      insertOne: {
        document: {
          ...tx,
          userId,
          isRecurring: false,
          nextRecurringDate: null,
          recurringInterval: null,
          lastProcesses: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }));
   
    const result = await transactionModel.bulkWrite(bulkOps, {
      ordered: true,
    });

    const data= {
      insertedCount: result.insertedCount,
      success: true,
    };
   
    return res.status(200).json({data,message:"Bulk copies Inserted"})
  } catch (error) {
   (error)
     return res.status(501).json({message:error.messgae})
  }
};

export const scanRecipet = async(req,res)=>{
    try{
     
          const userId = req.user?.id;
         
          const file = req.file;
         
          if(!file)
             return res.status(404).json({message : "No file found"})
           if(!file.buffer)
               return res.status(404).json({message : "FAiled to upload file"})
           
           const base64String = req.file.buffer.toString("base64");
           if(!base64String)
              return res.status(400).json({message : "Cannot process file"})
           const result = await genAI.models.generateContent({
            model: genAIModel,
            contents: [{ text: receiptPrompt },  { inlineData: { data: base64String, mimeType: req.file.mimetype } }] ,
            config: { responseMimeType: "application/json",temperature :0,topP : 1 }
            });
       
           const response = result.text;
          
           const cleanedText = response?.replace(/```(?:json)?\n?/g,"").trim();
           const data = JSON.parse(cleanedText);
        
           const transaction = {
              title : data.title || "Receiept",
              amount : data.amount,
              date: data.date,
              description :data.description,
              category : data.category,
              paymentMethod : data.paymentMethod,
              type:data.type,
              recieptUrl:data.recieptUrl || ''
           }

          
           return res.status(200).json({transaction ,message :"Reciept scanned sucessfully"})
    }
    catch(err)
    {
      console.log(err)
        return res.status(404).json({message : err.message})
    }
}