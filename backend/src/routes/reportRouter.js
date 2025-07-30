import express from "express"

import { authProtection } from "../middlewares/authProtected.js";
import{generateReport, getAllReports, updateReportSetting} from "../controllers/reportController.js"
const router = express.Router();

router.get("/create",authProtection,generateReport)
router.get("/all",authProtection,getAllReports)
router.put("/update",authProtection,updateReportSetting)
export  const reportRouter= router;