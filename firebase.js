const express=require('express');
const firebase=require('firebase/app');
const GoogleAuthProvider=require('firebase/auth');

const {getStorage,ref, uploadBytes}=require('firebase/storage')

const firebaseConfig = {
    apiKey: "AIzaSyBMU1YOkI0kQZc5L8dBBDIkjObVymwUPCc",
    authDomain: "shiva-6ac48.firebaseapp.com",
    projectId: "shiva-6ac48",
    storageBucket: "shiva-6ac48.appspot.com",
    messagingSenderId: "934556573168",
    appId: "1:934556573168:web:1df2165631b2f0f10e9135"
  };

module.exports=firebase.initializeApp(firebaseConfig);