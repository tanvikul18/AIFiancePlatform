import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import {Env} from "./src/config/env.config.js"
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { connectDB } from "./src/config/db.config.js";
import { authRouter } from "./src/routes/authRoutes.js";
import { userRouter } from "./src/routes/userRoutes.js";
import { transactionRouter } from "./src/routes/transactionRoutes.js";
import { analyticsRouter } from "./src/routes/analyticRoutes.js";
import {reportRouter} from "./src/routes/reportRouter.js"
import { startJob } from "./src/crons/scheduler.js";
import { initialiseCron } from "./src/crons/index.js";
import { calculateNextReportDate, getdateRange } from "./src/utils/helper.js";
import multer from "multer";
import { paymentRouter } from "./src/routes/paymentRoutes.js";
dotenv.config();
const app = express();

app.use(cors({
  origin: '*',  // Specific origin
  credentials: true                 // Allow cookies/auth headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//.use(errorHandler)


//Authentication Routes
app.use("/auth",authRouter)
console.log("USer updation")
app.use("/user",userRouter);
app.use("/transaction",transactionRouter)
app.use("/report",reportRouter)

app.use("/analytics",analyticsRouter)
app.use("/subscription",paymentRouter)
const port = Env.PORT;
//console.log(Env.PORT)
calculateNextReportDate()
app.listen(port,async()=>{
  console.log(Env.NODE_ENV)
   // if(Env.NODE_ENV === "development")
    await initialiseCron()
    await connectDB();
    console.log(`Server running on port ${port}`)
})