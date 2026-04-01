import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyoKgz_SN2rlRq45qPagLoHMD0b2_cCZ4",
  authDomain: "tripplan-91399.firebaseapp.com",
  projectId: "tripplan-91399",
  storageBucket: "tripplan-91399.firebasestorage.app",
  messagingSenderId: "514503848414",
  appId: "1:514503848414:web:a1b0b5e07022407110ed4f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);