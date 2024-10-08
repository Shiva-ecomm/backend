const express=require('express');
const { uploadImagesController, getAllTendorsController, getTendorDetail, changeStateController, updateQuotationController } = require('../controllers/tendorController');
const multer = require('multer');

// Set up multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router=express.Router();

router.post('/upload-images',upload.array('files'),uploadImagesController)
// all tendors
router.get('/get-tendors',getAllTendorsController)
// get specific tendor 
router.get('/get-tendor/:id',getTendorDetail)
// change tendor state

router.post('/change-state/:id',changeStateController)

router.post('/update-quotation/:clientId/:postId',updateQuotationController)

module.exports=router;