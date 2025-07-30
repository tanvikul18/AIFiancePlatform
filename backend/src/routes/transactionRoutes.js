import express from "express"

import { authProtection } from "../middlewares/authProtected.js";
import { createTransaction,duplicateTransaction,deleteTransaction,getAllTransactions,getTransactionByID, scanRecipet, updateTransaction, bulkcreateTransaction, bulkdeleteTransaction } from "../controllers/transactionController.js";
import { upload } from "../config/cloudinary.config.js";
const router = express.Router();

router.post("/create",authProtection,createTransaction)
router.post("/scan-receipt",upload,scanRecipet)
router.get("/",authProtection,getAllTransactions)
router.get("/:id",authProtection,getTransactionByID)
router.put("/duplicate/:id",authProtection,duplicateTransaction)
router.put("/update/:id",authProtection,updateTransaction)
router.delete("/delete/:id",authProtection,deleteTransaction)
router.post("/create-bulk",authProtection,bulkcreateTransaction)
router.delete("/delete-bulk",authProtection,bulkdeleteTransaction)
export const transactionRouter= router;