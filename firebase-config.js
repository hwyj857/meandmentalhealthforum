
// import the functions you need from the sdks you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// your web app's firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMAoiImzNiKstsWIFiFQDacc0jGrK0HwE",
  authDomain: "mentalhealthandcatsforum.firebaseapp.com",
  projectId: "mentalhealthandcatsforum",
  storageBucket: "mentalhealthandcatsforum.appspot.com",
  messagingSenderId: "193061207603",
  appId: "1:193061207603:web:66de68145c5d6cbed92d46",
  measurementId: "G-GPXKHW6YKV"
};

// initialize firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
