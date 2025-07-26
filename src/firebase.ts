// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Добавляем импорт Storage

const firebaseConfig = {
  apiKey: "AIzaSyBXWBVDoIwS5kOBKDF90BrEcR8M32Cv7m0",
  authDomain: "pull-push-ai.firebaseapp.com",
  projectId: "pull-push-ai",
  storageBucket: "pull-push-ai.firebasestorage.app",
  messagingSenderId: "160707453652",
  appId: "1:160707453652:web:1783fe97d151dcc0a25141",
  measurementId: "G-Z4ZZ1T3MQY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Инициализируем Storage

export { auth, db, storage }; // Экспортируем storage
export type { User } from "firebase/auth";