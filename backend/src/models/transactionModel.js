

import mongoose from "mongoose";

import { convertToCents, convertToDollar } from "../utils/formatCurrency.js";
export const TransactionStatus= {
  PENDING : "PENDING",
  COMPLETED : "COMPLETED",
  FAILED : "FAILED",
}

export const RecurringInterval= {
  DAILY : "DAILY",
  WEEKLY : "WEEKLY",
  MONTHLY : "MONTHLY",
  YEARLY : "YEARLY",
}

export const TransactionType= {
  INCOME : "INCOME",
  EXPENSE : "EXPENSE",
}
export const PaymentMethodEnum={
   CARD:"CARD",
  BANK_TRANSFER :"BANK_TRANSFER",
  MOBILE_PAYMENT: "MOBILE_PAYMENT",
  AUTO_DEBIT : "AUTO_DEBIT",
  CASH :"CASH",
  OTHER : "OTHER",
}
const transactionSchema = new mongoose.Schema({
  userId:{
     type : String,
    
  },
  title:{
     type :String,
     require:true
  },
  type:{
     type :String,
     enum: Object.values(TransactionType),
     default : TransactionType.EXPENSE
  },
  amount:{
     type : Number,
     set : (value)=>convertToCents(value),
     get : (value)=>convertToDollar(value)
    
  } ,
    description:{
     type :String,
     
  },
    category:{
     type :String,
  },
  date : {
    type: Date,
    require : true
  },
    receiptUrl:{
     type :String,
     
  },
     isRecurring:{
     type : Boolean,
     default : false
     
  },
   recurringInterval :{
      type : String,
      enum :Object.values(RecurringInterval),
      default :null
   },
   nextrecurringDate :{
      type : Date,
      default :null
   },
    lastprocessed :{
      type : Date,
      default :null
   },
    status :{
      type : String,
      enum :Object.values(TransactionStatus),
      default : TransactionStatus.COMPLETED
   },
     paymentMethod :{
      type : String,
      enum :Object.values(PaymentMethodEnum),
      default : PaymentMethodEnum.CASH
   }  
},
{
    timestamps :true
})

export const transactionModel = mongoose.model('TransactionModel',transactionSchema)