const express=require('express');
const firebase=require('firebase/app');
const GoogleAuthProvider=require('firebase/auth');

const {getStorage,ref, uploadBytes}=require('firebase/storage')

const firebaseConfig = {
  apiKey: "AIzaSyBQxN65-T_O2hrBnNfUPzXLFAloWrbc-H0",
  authDomain: "shiva-e-comm.firebaseapp.com",
  projectId: "shiva-e-comm",
  storageBucket: "shiva-e-comm.appspot.com",
  messagingSenderId: "615522822837",
  appId: "1:615522822837:web:2bc3e12f72fdb837502cfc"
};

module.exports=firebase.initializeApp(firebaseConfig);