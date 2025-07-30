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
import { format } from "date-fns";
import { response } from "express";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { createUser } from "./authController.js";
import { createUserContent } from "@google/genai";
import { reportModel } from "../models/reportModel.js";
import { convertToDollar } from "../utils/formatCurrency.js";
import { reportInsightPrompt } from "../utils/prompt.js";

export const getAllReports=async(req,res)=>{
  try{
      const userId = req.user?.id
     
      const {pageSize,pageNumber} = req.query;
        const pagination = {
            pageSize : pageSize || 20,
            pageNumber : pageNumber || 1 

        }
        const query = {userId}
        const skip = (pageNumber - 1) * pageSize ;
         const reports = await reportModel.find({userId});
       
         const totalCount = await reportModel.countDocuments(query);
           const totalPages =Math.ceil(totalCount / pageSize);
      if(reports)
      {
        return res.status(200).json({reports,pagination:{
           pageSize,
           pageNumber,
            totalCount,
            totalPages
        },message:"All Reports fetched sucessfully."})
      }
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}


export const updateReportSetting=async(req,res)=>{
  try{
      const userId = req.user?.id;
      const {isEnabled} = req.body;
      let nextReportDate = '';
      const existingReportSetting= await reportSettingModel.findOne({userId});
      if(!existingReportSetting)
         return res.status(404).json({message:"No report setting found"})
       const frequency = existingReportSetting.frequency || "Monthly";
       if(isEnabled)
       {
        const currentNextReportDate= existingReportSetting.nextReportDate;
        const now = new Date();
        if(!currentNextReportDate || currentNextReportDate <= now)
        {
            nextReportDate = calculateNextReportDate(existingReportSetting.lastSentDate)
        }
        else{
            nextReportDate = currentNextReportDate;
        }
       }
      existingReportSetting.set({
        ...req.body,
        nextReportDate
      })
    await existingReportSetting.save();
    return res.status(200).json({data : existingReportSetting , message : "Report setting saved sucessfully"})
  }
  catch(err)
  {
     return res.status(404).json({message : err.message})
  }
}

export const generateReport = async (userId,from,to) => {
  try {
  //  const userId = req.user?.id;
 
   // const { from, to } = req.query;
    
    const fromDate = new Date(from.toString());
    const toDate = new Date(to.toString());
   
    const results = await transactionModel.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: fromDate, $lte: toDate }
        }
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "INCOME"] },
                      { $abs: "$amount" },
                      1
                    ]
                  }
                },
                totalExpense: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "EXPENSE"] },
                      { $abs: "$amount" },
                      1
                    ]
                  }
                }
              }
            }
          ],
          categories: [
            { $match: { type: "EXPENSE" } },
            {
              $group: {
                _id: "$category",
                total: { $sum: { $abs: "$amount" } }
              }
            },
            { $sort: { total: -1 } },
            { $limit: 5 }
          ]
        }
      },
      {
        $project: {
          totalIncome: { $arrayElemAt: ["$summary.totalIncome", 0] },
          totalExpense: { $arrayElemAt: ["$summary.totalExpense", 0] },
          categories: 1
        }
      }
    ], { allowDiskUse: true });
   //console.log(results
   const resdata  ={ totalIncome: 0, totalExpense: 0, categories: [], availableBalance: 0, savingsRate: 0 }
    if (!results.length || (results[0].totalIncome === 0 && results[0].totalExpense === 0)) {
      return resdata;
    }

    const { totalIncome = 0, totalExpense = 0, categories = [] } = results[0];

    const topCategories = categories.reduce((acc, { _id, total }) => {
      acc[_id] = {
        amount: (total),
        percentage: totalExpense > 0
          ? Math.round((total / totalExpense) * 100)
          : 0
      };
      return acc;
    }, {});

    const availableBalance = totalIncome - totalExpense;
    const savingsRate = calculatingSavingRate(totalIncome, totalExpense);
      const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;
   const insights = await generateInsightsAI({
    totalIncome,
    totalExpense,
    availableBalance,
    savingsRate,
    categories: topCategories,
    periodLabel: periodLabel,
   })
 
    const data={
       
        period : periodLabel,
        summary :{
            totalIncome: (totalIncome),
            totalExpense: (totalExpense),
            availableBalance: (availableBalance),
            savingsRate,
            topCategories
        },
        insights
      };
      return data;

  } catch (err) {
   // return res.status(400).json({ message: err.message });
    console.error("Failed to generate report:", err);
  }
};

async function generateInsightsAI({
  totalIncome,
  totalExpense,
  availableBalance,
  savingsRate,
  categories,
  periodLabel
}) {
  try {
   
    const prompt = reportInsightPrompt({
      totalIncome: convertToDollar(totalIncome),
      totalExpense: convertToDollar(totalExpense),
      availableBalance: convertToDollar(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      categories,
      periodLabel,
    });

  
   
    const result = await genAI.models.generateContent({
    model: genAIModel,
    contents: { parts: [{ text: prompt }] },
    config: { responseMimeType: "application/json" }
    });
   
    const response = result.text;
    
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) return [];

    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    return [];
  }
}

function calculatingSavingRate(tincome,texpenses){
    if(tincome <=0) return 0;
    const savingsRate =(tincome - texpenses)/tincome * 100;
    return parseFloat(savingsRate);


    
}

