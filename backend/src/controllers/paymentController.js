
import { Env } from "../config/env.config.js";
import { payemntModel } from "../models/paymentModel.js";
import { userModel } from "../models/userModel.js";
import Razorpay from "razorpay"
const razorpayInstance = new Razorpay ({
    key_id: Env.RAZORPAY_KEY_ID,
    key_secret:Env.RAZORPAY_KEY_SECRET
}) ;

export const dopaymentRazorpay = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        const {planId}  = req.body;
        const userData = await userModel.findById(userId)
         
        if (!userData || !planId) {
            
            return res.json({ success: false, message: 'Missing Details' })
        }

        // creating options for razorpay payment
        let days, plan, amount, date;

        switch (planId) {
           
            case 'Pro Plan Advanced':
                plan = 'Pro Plan Advanced'
                days = 30,
                amount = 9.99
                break;
            case 'Pro Plan Premier':
                plan = 'Pro PlanPremier'
                days  = 365
                amount = 99.99
                break;
        
            default:
                return res.json({success: false, message: 'plan not found'});
        }

        date = Date.now();
      console.log(plan,days,amount)
        const paymentData ={
            userId, plan,  days, amount,date
        }

        const newPayment = await payemntModel.create(paymentData)

        const options = {
            amount:amount * 100,
            currency: process.env.CURRENCY,
            receipt: newPayment._id,
        }

        await razorpayInstance.orders.create(options, (error, order)=>{
            if (error) {
                console.log(error);
                return res.json({success:false, message:error})
            }
            res.json({success: true, order})
        })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
export const verifyRazorpay = async (req, res) => {
    try {
        console.log("razorpay",req.body)
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            const paymentData = await payemntModel.findById(orderInfo.receipt)
            if (paymentData.payment) {
                return res.json({success: false, message: 'Payment Failed'})
            }

            const userData = await userModel.findById({_id:paymentData.userId})
          
            // const creditBalance = userData.creditBal + transactionData.credits
            //  console.log("creditBalance",creditBalance)
            // await userModel.findByIdAndUpdate(userData._id, {creditBal:creditBalance})
            await payemntModel.findByIdAndUpdate(paymentData._id, {payment:true})
            res.json({ success: true,paymentData, message: "Subscription Done" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}