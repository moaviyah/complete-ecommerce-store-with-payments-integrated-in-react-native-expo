// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyD69tFexDfdQnDva9nPxSu6hz6jWB_s6RE",
  authDomain: "uspinuwinuship-ef703.firebaseapp.com",
  databaseURL: "https://uspinuwinuship-ef703-default-rtdb.firebaseio.com",
  projectId: "uspinuwinuship-ef703",
  storageBucket: "uspinuwinuship-ef703.appspot.com",
  messagingSenderId: "807251399317",
  appId: "1:807251399317:web:7f869c474f64c1d03ec19c"
};


// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);