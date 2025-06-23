import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if any of the required environment variables are missing
if (!process.env.REACT_APP_FIREBASE_API_KEY || 
    !process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    !process.env.REACT_APP_FIREBASE_PROJECT_ID) {
  console.error(
    'Firebase configuration error: Environment variables are missing. ' +
    'Make sure you have created a .env file with the required Firebase configuration.'
  );
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
