import express from "express"
import { getUserProfile,updateUserInfo } from "../controllers/userController.js";
import { authProtection } from "../middlewares/authProtected.js";
import { upload } from "../config/cloudinary.config.js";
import multer from "multer";
const router = express.Router();
const app=express();
//console.log("USer update route")
router.get("/",authProtection,getUserProfile)
router.post("/update",authProtection,upload,updateUserInfo)

export  const userRouter= router;