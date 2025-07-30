import cron from 'node-cron';
import { processRecurringTransactions } from './jobs/transaction.jobs.js';
import { processReportJob } from './jobs/reports.jobs.js';
const scheduleJob=(name,time,job) => {
  //   console.log("running a task very minute")
  console.log(name,time,job)
     return cron.schedule(time,async()=>{
         try{
                 await job();
                 console.log(`${name} completed`)
         }
         catch(err){
               console.log(`${name} failed`,err)
         }
     },{
        scheduled :true,
        timezone : "UTC"
     })
}; 
export const startJob=()=>{
 return[
    scheduleJob('Transactions','5 0 * * *',processRecurringTransactions),
    //run 2.30am very first of month
    scheduleJob('Reports',"30 2 1 * *",processReportJob)
 ]
}
