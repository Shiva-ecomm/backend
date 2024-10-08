const mongoose = require('mongoose');

// Define the client model (assuming it's in a separate file and exported as 'clientModel')
const clientModel = require('./clientModel'); 
const { Decimal128 } = mongoose.Schema.Types;
const postSchema = mongoose.Schema({
    postId: {
        type: String,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    qty: {
        type: String,
        default: 0
    },
    images: [{
        type: String
    }],
    quotations: [{
        party: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClientModel'  // Replace with your actual Client model name
        },
        rate: {
            type: Decimal128
        },
        addedOn:{
            type:Date,
            default:Date.now()
        }
    }],
    validParty:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientModel' 
    }],
    createdOn: {
        type: Date,
        default: Date.now, // Automatically set to current date
    },
    closesOn: {
        type: Date,
        default: () => Date.now() + (1000 * 60 * 60 * 48), // Automatically set to 48 hours later
    },
    active:{
        type:Boolean,
        default:true
    },
    addedBy:{
       type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    addedByName:{
       type: String,
       
    }
});

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;
