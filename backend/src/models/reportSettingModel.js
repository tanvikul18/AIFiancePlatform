

import mongoose from "mongoose";


const reportSettingSchema = new mongoose.Schema({
  userId:{
     type: String,
     require:true
  },
  frequency:{
     type: String,
     enum: ["Monthly"],
     default :"Monthly",
     require:true
  },
  isEnabled:{
     type: Boolean,
     default: false
  },
  nextReportDate:{
    type: Date
  },
   lastSentDate:{
    type: Date
  }

},
{
    timestamps :true
})

export const reportSettingModel = mongoose.model('ReportSettingModel',reportSettingSchema)