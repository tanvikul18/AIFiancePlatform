

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId:{
     type :String,
     require:true
  },
  plan:{
     type :String,
     require:true
  },
  days:{
    type:Number,
    require:true
   },
    amount:{
    type:Number,
    require:true
    },
    payment:{
        type:Boolean,
        default:false
    },
    date:{
        type: Date
    }

},
{
    timestamps :true
})

export const payemntModel = mongoose.model('PaymentModel',paymentSchema)