const mongoose=require('mongoose');

const clientSchema=mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    country:{
        type:String
    },
    companyName:{
        type:String
    }

})

const clientModel=mongoose.model('clients',clientSchema);

module.exports=clientModel;