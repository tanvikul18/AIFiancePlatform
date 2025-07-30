import { startJob } from "./scheduler.js";


export const initialiseCron =async()=>{
   try{
        const jobs = startJob();
        console.log(`${jobs.length} cron jobs running`);
        return jobs;
   }
   catch(err)
   {
     console.log("cron init error",err);
     return [];
   }
}