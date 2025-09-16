// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMAoiImzNiKstsWIFiFQDacc0jGrK0HwE",
  authDomain: "mentalhealthandcatsforum.firebaseapp.com",
  projectId: "mentalhealthandcatsforum",
  storageBucket: "mentalhealthandcatsforum.appspot.com",
  messagingSenderId: "193061207603",
  appId: "1:193061207603:web:66de68145c5d6cbed92d46",
  measurementId: "G-GPXKHW6YKV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { 
  auth, db, storage, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, deleteDoc, doc, updateDoc,
  ref, uploadBytes, getDownloadURL
};