export const errorHandler=(err,req,res,next)=>{
  return res.status(500).json({message:"Internal Server Error",error:err.message})
}