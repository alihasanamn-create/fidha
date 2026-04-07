import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZXLP2sJiLmwmMuOX5Fk2PmggXw7VGLJ0",
  authDomain: "fidha-accounts.firebaseapp.com",
  projectId: "fidha-accounts",
  storageBucket: "fidha-accounts.firebasestorage.app",
  messagingSenderId: "562921828350",
  appId: "1:562921828350:web:84529450c976c823e0daaf",
  measurementId: "G-3GJCC17NDB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);