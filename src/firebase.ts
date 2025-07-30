import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCltPuGZ5AnRNxRNcMqMIidLxoLUlgcRe4",
  authDomain: "pull-push-ai.firebaseapp.com",
  projectId: "pull-push-ai",
  storageBucket: "pull-push-ai.firebasestorage.app",
  messagingSenderId: "160707453652",
  appId: "1:160707453652:web:1783fe97d151dcc0a25141",
  measurementId: "G-Z4ZZ1T3MQY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Добавляем экспорт storage