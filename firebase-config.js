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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

export { app, auth, db };