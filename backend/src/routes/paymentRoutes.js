import express from "express"
import {authProtection} from "../middlewares/authProtected.js"
import { verifyRazorpay ,dopaymentRazorpay } from "../controllers/paymentController.js";
const router = express.Router();

router.post("/verify",authProtection,verifyRazorpay)
router.post("/pay",authProtection,dopaymentRazorpay)


export  const paymentRouter= router;