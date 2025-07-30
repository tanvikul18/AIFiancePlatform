import {v2 as cloudinary} from "cloudinary"
import {CloudinaryStorage} from "multer-storage-cloudinary"
import path from 'path';

import multer from "multer"
import { Env } from "./env.config.js"

cloudinary.config({
 cloud_name :Env.CLOUDINARY_CLOUD_NAME,
 api_key: Env.CLOUDINARY_API_KEY,
 api_secret:Env.CLOUDINARY_API_SECRET
})




export const upload = multer({ storage: multer.memoryStorage() }).single("file");


