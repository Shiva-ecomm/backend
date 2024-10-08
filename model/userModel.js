const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    userId:{
        type:String,
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        max:50,
    },
    password:{
        type:String,
        // required:true,
        default:null,
        min:8,
    },
    phone:{
        type:Number,
        default:0,
    },
   
    
  
    isAdmin:{
        type:Boolean,
        default:false,
    },
  
    

})

const userModel=mongoose.model('users',userSchema);

module.exports=userModel;