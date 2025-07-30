import { date, success } from "zod"
import { transactionModel } from "../../models/transactionModel.js";
import { calculateNextOccurence } from "../../utils/helper.js";
import mongoose from "mongoose";

export const processRecurringTransactions=async()=>{
 const now = new Date();
 let processedCount=0;
 let failedCount=0;
 try{
       const transactionCursor =  transactionModel.find({
        isRecurring: true,
        nextrecurringDate: {$lte : now}
       }).cursor();

       console.log("Start recurring process")
       for await(const tx of transactionCursor)
       {
            const nextDate = calculateNextOccurence(tx.nextrecurringDate,tx.recurringInterval);

            const session = await mongoose.startSession();
            try{
                  await session.withTransaction(async()=>{
                    await transactionModel.create([
                        
                        {...tx.toObject(),
                        _id : new mongoose.Types.ObjectId(),
                        title : `Recurring = ${tx.title}`,
                        date : tx.nextrecurringDate,
                        isRecurring : false,
                        nextrecurringDate :null,
                        recurringInterval:null,
                        lastprocessed: null
                        }
                        ,{
                            session
                        }

                    ])
                    await transactionModel.updateOne({
                        _id: tx._id
                    },{
                        $set :{
                        nextrecurringDate : nextDate,
                        lastprocessed : now
                        }
                    },{
                         session
                    }),
                    {
                        maxCommitTimeMS : 20000,
                    }
                  })
                  processedCount++;
            }
            catch(err)
            {
                    failedCount++;
                    console.log(`FAiled recurring in :${tx._id}`,err.message)
            }
       }
       console.log(`Processed : ${processedCount} transaction`)
      
       return{
        success:true,
        processedCount,
        failedCount

       }
 }
 catch(err)
 {
     console.log(`FAiled : ${failedCount} transaction`)
      return{
        success:false,
        error : err.message

       }
 }
}