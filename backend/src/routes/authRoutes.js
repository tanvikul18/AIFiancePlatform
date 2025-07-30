import express from "express"
import {createUser,loginUser} from "../controllers/authController.js"
const router = express.Router();

router.post("/signin",createUser)
router.post("/login",loginUser)


export  const authRouter= router;