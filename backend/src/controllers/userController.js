import { userModel } from "../models/userModel.js";


export const getUserProfile=async(req,res)=>{
 try{
     const id = req.user.id;
     const CurrentUser = await userModel.findOne({_id : id});
     if(CurrentUser)
     {
         return res.status(200).json({user:CurrentUser,message:"Current User fecthed Sucessful"})
     }
     else{
              return res.status(404).json({message:"Unable to fetch User"})
     }
 }
 catch(err)
 {
       return res.status(404).json({message:err.message})
 } 
}

export const updateUserInfo=async(req,res)=>{
    debugger;
 try{
 
     const id = req.user.id;
   
    const file = req.file;
            
              if(!file)
                 return res.status(404).json({message : "No file found"})
               if(!file.buffer)
                   return res.status(404).json({message : "FAiled to upload file"})
              const base64String = req.file.buffer.toString("base64");  
               
                const fullBase64 = `data:image/jpg;base64,${base64String}`
           
     const body = req.body;
   
     const CurrentUser = await userModel.findById(id);
  
     if(CurrentUser)
     {
        if (req.file) {
                CurrentUser.profilePicture = fullBase64;
            }
        
         CurrentUser.set({
            name : body.name,

         })

          await CurrentUser.save();
          return res.status(200).json({data : CurrentUser,message:"Current User Updated Sucessful"})
     }
     else{
              return res.status(404).json({message:"Unable to fetch User"})
     }
 }
 catch(err)
 {
       return res.status(404).json({message:err.message})
 } 
}