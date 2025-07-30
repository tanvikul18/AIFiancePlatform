import { getEnvValues } from "../utils/getEnvValues.js"

 const envConfig=()=>({
    NODE_ENV: getEnvValues("NODE_ENV","development"),
    PORT: getEnvValues("PORT","3000"),
    BASE_PATH : getEnvValues("BASE_PATH","/api"),
    MONGO_URI : getEnvValues("MONGO_DB_URL","mongodb+srv://user_test:root_test@cluster0.auqnbcm.mongodb.net/finance?retryWrites=true&w=majority&appName=Cluster0"),
    FRONTEND_ORIGIN : getEnvValues("FRONTEND_ORIGIN","localhost"),
    JWT_SECRET_KEY: getEnvValues("JWT_SECRET_KEY","secret_key"),
    CLOUDINARY_CLOUD_NAME : getEnvValues("CLOUDINARY_CLOUD_NAME","djrrl7nn5"),
    CLOUDINARY_API_KEY: getEnvValues("CLOUDINARY_API_KEY","536574249984523"),
    CLOUDINARY_API_SECRET : getEnvValues("CLOUDINARY_API_SECRET","**********"),
    GEMINI_API_KEY:getEnvValues("GEMINI_API_KEY","AIzaSyCQ3DflJMTTvmvupfcf_EZbYN5v2OmMhPw"),
    RESEND_API_KEY:getEnvValues("RESEND_API_KEY","resebd_api_key"),
    RESEND_MAIL_SENDER:getEnvValues("RESEND_MAIL_SENDER","onboarding@resend.dev"),
    RAZORPAY_KEY_ID:getEnvValues("RAZORPAY_KEY_ID","rzp_test_nOOIHiYFuvEJkm"),
    RAZORPAY_KEY_SECRET:getEnvValues("RAZORPAY_KEY_SECRET","rHaopM72HRGKWvonko2qk7qO")
})

export const Env = envConfig();