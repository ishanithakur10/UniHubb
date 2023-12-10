// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDttJjC9qAleiXjjlmAsp8BOINwvN9w8p8",
  authDomain: "dashboard-dfbc9.firebaseapp.com",
  projectId: "dashboard-dfbc9",
  storageBucket: "dashboard-dfbc9.appspot.com",
  messagingSenderId: "348740542986",
  appId: "1:348740542986:web:9069f870fd1319eeb435f3",
  measurementId: "G-NGLYY3SQ5Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth=getAuth();
export const storage = getStorage(app);