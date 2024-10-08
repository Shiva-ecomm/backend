const clientModel = require("../model/clientModel");

// add a party in the DB
const addPartyController=async(req,res)=>{
    const {name,email,address,city,state,country,companyName,phone}=req.body;
    // console.log(req.body)
    try{
        const party=await clientModel.findOne({email:email});
        if(party){
            return res.status(400).send({message:'Party already exists',success:false});
        }
        const newParty=new clientModel({
            name,email,address,city,state,country,companyName,phone
        });
        await newParty.save();

        return res.status(200).send({success:'Party added successfully',success:true,newParty});
        
    }catch(error){
        // console.log(error.message)
        return res.status(500).send({success:false,message:'Internal Server Error'});
    }
}

// To get all parties from the DB
const getAllPartyController=async(req,res)=>{
    // console.log(req.headers)
    try{
        const parties=await clientModel.find();
        if(!parties){
            return res.status(400).send({message:'No party found',success:false});
        }
        return res.status(200).send({message:'All parties fetched',success:true,parties});
    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}

// to get a specific party from the DB w.r.t the party id
const getPartyController=async(req,res)=>{
    const id=req.params.id;
    try{
        const party=await clientModel.findOne({_id:id});
        if(!party){
            return res.status(400).send({message:'Party not found',success:false});
        }
        return res.status(200).send({message:'Party fetched',success:true,party});
    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}


// delete a party from DB with a specific ID

const deleteController=async(req,res)=>{
    const id=req.params.id
    try{
        const party=await clientModel.findOne({_id:id});
        if(!party){
            return res.status(400).send({message:'Party does not exist',success:false});
        }

        await party.deleteOne();
        return res.status(200).send({message:'Party delete successfully',success:true,party});


    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}

const deleteAllController=async(req,res)=>{
    try{
        const party=await clientModel.find();
        if(!party){
            return res.status(400).send({message:'No party to delete',success:false});
        }
        for(let item of party){
            await item.deleteOne();
        }

        // await party.deleteAll();
        return res.status(200).send({message:'Deleted all parties successfully',success:true});
    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}

const updateController = async (req, res) => {
    const id = req.params.id;
    const updateData = req.body; // Get the data to update
    // console.log(updateData)
    try {
        // Find the party by ID
        const party = await clientModel.findById(id);
        
        if (!party) {
            return res.status(404).send({ message: 'Party does not exist', success: false });
        }

        // Update the party document with the new data
        Object.assign(party, updateData);

        // Save the updated document
        await party.save();

        return res.status(200).send({ message: 'Updated successfully', success: true, party });
    } catch (error) {
        // console.error(error); // Log the error for debugging purposes
        return res.status(500).send({ message: 'Internal Server Error', success: false });
    }
};

module.exports={addPartyController,getAllPartyController,getPartyController,deleteController,updateController,deleteAllController};