const userModel = require("../model/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer=require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');

// Register Controller
const registerController = async (req, res) => {
    try {
        // Destructure user details from request body
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already present',
                success: false
            });
        }

        // Hash the password before saving it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user instance
        const newUser = new userModel({
            name,
             email,
            password: hashedPassword,
            phone
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success message
        return res.status(200).json({
            message: "Account created. Please login.",
            success: true
        });

    } catch (error) {
        // console.error('Error during registration:', error);  // Log the error for debugging
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false
        });
    }
};

const loginController=async(req,res)=>{
    try{

        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).send({message:'Please provide email and password',success:false});
        }

        const user=await userModel.findOne({email:email});
        if(!user){
            return res.status(400).send({message:'User does not exists',success:true});
        }

        const isMatch = await bcrypt.compare(password, user?.password);
        if (!isMatch) {
            return res
            .status(400)
            .send({ message: "Invlid EMail or Password", success: false });
        }
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        return res.status(200).send({success:true,message:'Logged In',user,token});



    }catch (error) {
        // console.error('Error during registration:', error);  // Log the error for debugging
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false
        });
    }
}

const changeAdminController=async(req,res)=>{
    const id=req.params.id;
    try{
        const user=await userModel.findOne({_id:id});
        if(!user){
            return res.status(400).send({message:'User not found',success:false});
        }
        user.isAdmin=!user.isAdmin;
        await user.save();
        return res.status(200).send({message:'Admin status changed successfully',success:true,user});

    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}

const getAllUserController=async(req,res)=>{
    try{
        const users=await userModel.find();
        if(!users){
            return res.status(400).send({message:'Users not found',success:false});
        }
        // console.log(users)
        return res.status(200).send({message:'Users Fetched Successfully',success:true,users});

    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}
const getUserController=async(req,res)=>{
    const id=req.params.id;
    try{
        const user=await userModel.findOne({_id:id});
        if(!user){
            return res.status(400).send({message:'Users not found',success:false});
        }
        return res.status(200).send({message:'Users Fetched Successfully',success:true,user});

    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}

const deleteController=async(req,res)=>{
    const id=req.params.id;
    try{
        const user=await userModel.findOne({_id:id});
        if(!user){
            return res.status(400).send({message:'User not found',success:false});
        }

        await user.deleteOne();
        return res.status(200).send({message:'User deleted Successfully',success:true});
    }catch(error){
        return res.status(500).send({message:'Internal Server Error',success:false});
    }
}

const authController = async (req, res) => {
    
    try {
    //   console.log(req.body)
      const user = await userModel.findOne({ _id: req.body.userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
    //   console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: error.message, // Include the error message for debugging (not recommended in production)
      });
    }
  };


  const forgotPasswordController=async(req,res)=>{
    try{
        const {email}=req.body;
        // console.log(email)
        const user=await userModel.findOne({email:email})
        // console.log(user)
        if(!user){
            return res.status(404).send({success:false,message:'No User exists'})
        }
        const transporter = nodemailer.createTransport(smtpTransport({
            host:'smtp.gmail.com',
            port:'587',
           secure:false,
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS_KEY// Consider using an App Password for Gmail
            },
            // secure: true, // Use secure connection
            // logger: true,
            // debug: true,
            // tls:true
        }));

       

       
            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: email,
                subject: 'A New Tender Has Opened',
                text: `Dear Vendor,

                The link to Reset Your Password is given below. Please click on the link to reset your password.
                This link is valid only for 24 hours.

                https://shiva-e-comm.web.app/reset-password/${user?._id}

                Best regards,

                Shiva TexFabs`
            };

            try {
                await transporter.sendMail(mailOptions);
                // console.log(`Email sent to ${email}`);
            } catch (emailError) {
                // console.error(`Failed to send email to ${email}:`, emailError);
            }
        
            return res.status(200).send({success:true,message:'A email has been sent to your email id'})

        
    }catch (error) {
    //   console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server error',
        error: error.message, // Include the error message for debugging (not recommended in production)
      });
    }
  }


  const resetPasswordController=async(req,res)=>{
    try{
        const id=req.params.id;
        const {password}=req.body;
        const user=await userModel.findOne({_id:id});
        if(!user){
            return res.status(404).send({message:'User does not exist/ Link has expired',success:false})
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        user.password=hashedPassword;
        await user.save();
        return res.status(200).send({success:true,message:'Password reset successfully'})

    }catch (error) {
    //   console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server error',
        error: error.message, // Include the error message for debugging (not recommended in production)
      });
    }
  }
module.exports = { registerController,loginController,changeAdminController,getAllUserController,authController,
    getUserController,deleteController,forgotPasswordController,resetPasswordController };
