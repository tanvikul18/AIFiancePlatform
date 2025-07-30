

import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name:{
     type :String,
     require:true
  },
  email:{
     type :String,
     require:true
  },
  password:{
     type :String,
     require:true
  },
  profilePicture:{
     type : String ,
     default :null
    
  } 

},
{
    timestamps :true
})

export const userModel = mongoose.model('UserModel',userSchema)