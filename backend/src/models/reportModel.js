

import mongoose from "mongoose";
export const ReportStatus={
SENT: "SENT",
PENDING : "PENDING",
FAILED : "FAILED",
NO_ACTIVITY : "NO_ACTIVITY"
}
const reportSchema = new mongoose.Schema({
  userId:{
     type :String,
     require:true
  },
  period:{
     type :String,
     require:true
  },
  sendDate:{
     type :Date,
     require:true
  },
  status:{
     type : String,
     enum : Object.values(ReportStatus),
     default : ReportStatus.PENDING,
     require:true 
  } 

},
{
    timestamps :true
})

export const reportModel = mongoose.model('ReportModel',reportSchema)