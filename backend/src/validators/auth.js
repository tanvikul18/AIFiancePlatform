import {z} from "zod";

export const emailSchema = z
.string()
.trim()
.email("Invalid Email Address")
.min(1)
.max(255)

export const passwordSchema = z.string().trim().min(4)

export const signinSchema = z.object({
    name : z.string().trim().min(1).max(255),
    email:emailSchema,
    password:passwordSchema
})

export const loginSchema = z.object({
    
    email:emailSchema,
    password:passwordSchema
})