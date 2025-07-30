import express from "express"

import { authProtection } from "../middlewares/authProtected.js";
import { chartAnalytics, summaryAnalytics,expensePieChartBreakdownAnalytics } from "../controllers/analyticController.js";

const router = express.Router();

router.get("/summary",authProtection,summaryAnalytics)
router.get("/chart",authProtection,chartAnalytics)
router.get("/piechart",authProtection,expensePieChartBreakdownAnalytics)
export  const analyticsRouter= router;