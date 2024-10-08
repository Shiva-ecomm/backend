const express=require('express');
const { registerController, loginController, changeAdminController, deleteController,authController,
     getAllUserController, getUserController, 
     forgotPasswordController,
     resetPasswordController} = require('../controllers/userControllers');
const middleware=require('../middleware/middleware.js')
const router=express.Router();

router.post('/register',registerController)
router.post('/login',loginController)

// to get all the users
router.get('/getAllUsers',middleware,getAllUserController);

// to change the admin status
router.put('/changeAdmin/:id',middleware,changeAdminController);

// to delete a specific user
router.delete('/deleteUser/:id',middleware,deleteController);

// to delete a specific user
router.get('/getUser/:id',middleware,getUserController);

// get user data for authentication
router.post('/getUserData',middleware,authController);

router.post('/forgot-password',forgotPasswordController)

router.post('/reset-password/:id',resetPasswordController)

module.exports=router