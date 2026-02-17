// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAG5rhMNgIq03jM6Om-S12P1gK2h907m3w",
  authDomain: "dazzling-plate-471319-s7.firebaseapp.com",
  projectId: "dazzling-plate-471319-s7",
  storageBucket: "dazzling-plate-471319-s7.firebasestorage.app",
  messagingSenderId: "345892956089",
  appId: "1:345892956089:web:8c9edd73853453735bb868",
  measurementId: "G-HT3ZBT7BBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const auth = getAuth(app);