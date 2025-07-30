import { plans } from "../../../data/subscriptionPlan"
import { Button } from "../../../components/ui/button"
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { PROTECTED_ROUTES } from "../../../routes/common/routePath";
import { useDoPaymentsMutation, useVerifyPaymentsMutation } from "../../../features/subscription/subscriptionAPI";
import { useNavigate } from "react-router-dom";
import { updateSubscription } from "../../../features/auth/authSlice";
import { useDispatch } from "react-redux";
const BillingPlanCard = () => {
   const [doPayments, { isLoading }] = useDoPaymentsMutation();
   const[verifyPayments] = useVerifyPaymentsMutation();
   const navigate=useNavigate()
   const dispatch = useDispatch();
   const initPay = (order)=>{
    
    const options= {
      key :import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount : order.amount,
      currency: order.currency,
      name: 'Subscription Payment',
      description: 'Subscription Payment',
      order_id : order.id,
      reciept: order.reciept,
      handler: (response)=>{
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
        try{
             verifyPayments({razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature})
             .unwrap()
      .then((data) => {
        console.log(data?.paymentData?.plan)
        const subscriptionPlan = data?.paymentData?.plan;
          dispatch(updateSubscription(subscriptionPlan));
        toast.success('Payment Sucessful')   
        setTimeout(() => navigate(PROTECTED_ROUTES.OVERVIEW), 1000);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.data?.message || "Failed to verify payment");
      });
        }
        catch(err){
           toast.error(err.message)
        }
      }
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

   const paymentRazorpay =  (planId) => {
    console.log(planId)
     doPayments({planId})
      .unwrap()
      .then((data) => {
       console.log("DAta",data)
        initPay(data.order)
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.data?.message || "Failed to Payment");
      });
  }

  return (
    <div className='min-h[80vh] text-center pt-4 mb-5'>
       
       <h4 className='text-center text-lg font-bold mb-2 sm:mb-5'>
             Choose the Subscription
       </h4 >
       <p className='mb-3 text-sm text-muted-foreground'>Currently Yor are on your free trial. Please upgrade Advanced or Premier plans to enjoy the benifits.</p>
       <div className='flex flex-wrap items-center justify-center gap-6 text-left'>
          {
            plans.map((plan,index)=>{
                return <div key={index} className='drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500'>
                     
                      <p className='mt-3 mb-1 font-semibold'>{plan.id}</p>
                      
                      <p className='text-sm text-muted-foreground'>{plan.desc}</p>
                      <p className='mt-6'><span className='text-3xl'>₹{plan.price}</span> / {plan.days}</p>
                       
                      <Button disabled={isLoading} type="submit" onClick={()=>paymentRazorpay(plan.id)} className="w-full">
                                  {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                                  Purchase
                                </Button>
                      </div>
            })
          }
       </div>
    </div>
  )
}

export default BillingPlanCard