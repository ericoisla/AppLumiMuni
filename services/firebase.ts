
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDf5lJuUp0Qm_cpQGXJZYEgkHPSqgJdGys",
  authDomain: "munilaunion-3b7b5.firebaseapp.com",
  projectId: "munilaunion-3b7b5",
  storageBucket: "munilaunion-3b7b5.firebasestorage.app",
  messagingSenderId: "499500117730",
  appId: "1:499500117730:web:d84fc580eb1f720f6bf8bb",
  measurementId: "G-BKQ9M9GMCD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
