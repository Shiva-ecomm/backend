const admin = require('firebase-admin'); // Import Firebase Admin SDK
const { getDownloadURL, ref, uploadBytesResumable } = require('firebase/storage');
const firebase = require('../helpers/firebase');
const nodemailer = require('nodemailer');
const {  getStorage } = require('firebase/storage');
const serviceAccount = require('../helpers/serviceAccount'); // Replace with the path to your service account key file
const postModel = require('../model/postModel');
const formatDate = require('../helpers/formatDate');
const clientModel = require('../model/clientModel');
var smtpTransport = require('nodemailer-smtp-transport');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_PATH,
});

const uploadImagesController = async (req, res) => {
    try {
        const files = req.files; // `req.files` contains the uploaded files
        const { title, descr,colors ,qty, validParty, id, name } = req.body;
        console.log(req.body)

        // Check for uploaded files
        if (!files || files.length === 0) {
            return res.status(400).send({ success: false, message: 'No files uploaded' });
        }

        const downloadURLs = [];

        // Process each file
        for (const item of files) {
            const storage = getStorage(firebase);
            const storageRef = ref(storage, `files/${item.originalname}`);

            // Upload the file to Firebase Storage
            const uploadTask = uploadBytesResumable(storageRef, item.buffer);

            // Wait for the upload to complete
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        // Optionally log the upload progress
                    },
                    (error) => {
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref)
                            .then((downloadURL) => {
                                downloadURLs.push(downloadURL);
                                resolve();
                            })
                            .catch(reject);
                    }
                );
            });
        }

        // Create a new post with the data
        const newPost = new postModel({
            title,
            description: descr,
            color:JSON.parse(colors),
            qty,
            images: downloadURLs,
            validParty: JSON.parse(validParty),
            addedBy: id,
            addedByName: name,
        });

        const transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS_KEY, // Use environment variables for security
            },
        }));

        const closingDate = Date.now() + (1000 * 60 * 60 * 48); // Closing date 48 hours from now
        const partyList = JSON.parse(validParty);

        // Send emails and WhatsApp messages
        const sendNotifications = partyList.map(async (partyId) => {
            const party = await clientModel.findOne({ _id: partyId });
            if (!party) {
                return res.status(400).send({ message: 'Party not found', success: false });
            }

            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: party.email,
                subject: 'A New Tender Has Opened',
                text: `Dear Vendor,

                We are excited to announce that a new tender has been opened!

                Tender Title: ${title}
                Closing Date: ${formatDate(closingDate)}
                Details: ${descr}

                We encourage you to review the tender and submit your proposal by the closing date. If you have any questions or need further information, please don't hesitate to reach out. Below is the link to fill the tender: https://shiva-e-comm.web.app/SharingPage/${partyId}/${newPost._id}

                Best regards,

                Shiva TexFabs`
            };

            // Send email
            try {
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error(`Failed to send email to ${party.email}:`, emailError);
            }

            // WhatsApp Notification
            const predefinedMessage = ` We are excited to announce that a new tender has been opened!

                Tender Title: ${title}
                Closing Date: ${formatDate(closingDate)}
                Details: ${descr}

                We encourage you to review the tender and submit your proposal by the closing date. If you have any questions or need further information, please don't hesitate to reach out. Below is the link to fill the tender: https://shiva-e-comm.web.app/SharingPage/${partyId}/${newPost._id}

                Best regards`;
            
            // Check if the phone number exists before creating the WhatsApp URL
            if (party.phone) {
                const encodedMessage = encodeURIComponent(predefinedMessage);
                const whatsappUrl = `https://wa.me/${party.phone}?text=${encodedMessage}`;
                
                // Log the WhatsApp message link
                console.log(`WhatsApp message link: ${whatsappUrl}`);
            } else {
                console.log(`No phone number for party ID: ${partyId}, skipping WhatsApp message.`);
            }
        });

        // Wait for all notifications to be sent
        await Promise.all(sendNotifications);

        // Save the new post
        await newPost.save();
        return res.status(200).json({ success: true, message: 'Files uploaded successfully', newPost });

    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = uploadImagesController;


const getAllTendorsController = async (req, res) => {
    try {
        const tendors = await postModel.find().sort({ createdOn: -1 }); // Sort by createdOn in descending order
        
        if (!tendors || tendors.length === 0) {
            return res.status(404).send({ message: 'No tendors available', success: false });
        }

        const currentDate = Date.now();
        const updates = []; // Store updates to minimize DB calls

        for (const item of tendors) {
            if (item.closesOn < currentDate) {
                item.active = false;
                updates.push(item.save()); // Add save operations to the updates array
            }
        }

        // Execute all save operations concurrently
        await Promise.all(updates);

        return res.status(200).send({ message: 'Fetched', success: true, tendors });
    } catch (error) {
        // console.error('Error fetching tendors:', error.message);
        return res.status(500).send({ message: 'Internal Server Error', success: false });
    }
};



const getTendorDetail=async(req,res)=>{
    try{
        const id=req.params.id;
        const tendor=await postModel.findOne({_id:id});
        if(!tendor){
            return res.status(400).send({message:'No tendor found',success:false})
        }
        let quotations=[];
        for(let item of tendor?.quotations){
            const client=await clientModel.findOne({_id:item?.party});
            if(!client){
                return res.status(404).send({message:'Party not found',success:false})
            }
            quotations.push({addedOn:item?.addedOn,name:client?.name,email:client?.email,phone:client?.phone,city:client?.city,id:client?._id,rate:item?.rate})
        }
        return res.status(200).send({message:'tendor fetched',success:true,tendor,quotations})

    }catch(error){
        // console.log(error.message)
        return res.status(500).send({message:'Internal Server Error',success:false})
    }
}

const changeStateController=async(req,res)=>{
    try{
        const id=req.params.id;
        const tendor=await postModel.findOne({_id:id})
        if(!tendor){
            return res.status(400).send({success:false,message:'tendor not found'})
        }
        tendor.active=false;
        tendor.closesOn=Date.now();
        await tendor.save();
        return res.status(200).send({success:true,message:'Tendor closed successfully',tendor})

    }catch(error){
        // console.log(error.message)
        return res.status(500).send({message:'Internal Server Error',success:false})
    }
}

const updateQuotationController=async(req,res)=>{
    try{
        const clientId=req.params.clientId;
        const postId=req.params.postId;
        const {rate,color}=req.body;
        const post=await postModel.findOne({_id:postId});
        if(!post){
            return res.status(404).send({message:'Post not found',success:false})
        }
        post.quotations.push({party:clientId,rate:rate,color:color});
        await post.save();
        return res.status(200).send({success:true,message:'Quotation added successfully',post});

    }catch(error){
        // console.log(error.message)
        return res.status(500).send({message:'Internal Server Error',success:false})
    }
}

module.exports = { uploadImagesController,getAllTendorsController,getTendorDetail,changeStateController,updateQuotationController };
