import {z} from "zod";



export const baseTransactionSchema = z.object({
    title : z.string().min(1,"Title is required"),
   
    amount : z.number().positive("Amount must be positive").min(1),
    category:z.string().min(1,"Category is required"),
    date:z.union([z.string().datetime({message :"Invalid Date string"}),z.date()]),
    isRecurring:z.boolean().default(false),
    recurringInterval:z.enum(["DAILY","WEEKLY","MONTHLY","YEARLY"]).nullable().optional(),
    recieptUrl:z.string().optional(),
    paymentMethod:z.enum(["Cash","Bank_Transfer","Mobile_Payment","Auto_Debit","Card","Other"]).nullable().optional()
})

export const bulkDeleteTransactionSchema = z.object({
transactionIds :z.array(z.string().length(24,"Invalid Trnsacrion Id")).min(1,"Provide atleast 1 tranascrion ID")
})
export const createTransactionSchema = baseTransactionSchema;
export const updateTransactionSchema = baseTransactionSchema;
