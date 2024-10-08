const express=require('express');
const { addPartyController, getAllPartyController, getPartyController, deleteController, deleteAllController, updateController } = require('../controllers/clientControllers');

const router=express.Router();

const middleware=require('../middleware/middleware');

// add party in the DB route
router.post('/addParty',middleware,addPartyController);

// to get all parties from DB
router.get('/getParties',middleware,getAllPartyController);

// to get party specifice to id
router.get('/getParty/:id',getPartyController);

// delete party specific to id
router.delete('/deleteParty/:id',middleware,deleteController);

// delete all parties 
router.delete('/deleteAllParty',middleware,deleteAllController);

// update party specific to id
router.post('/updateParty/:id',middleware,updateController);

module.exports=router;