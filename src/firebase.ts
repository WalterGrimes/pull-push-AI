import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXWBVDoIwS5kOBKDF90BrEcR8M32Cv7m0",
  authDomain: "pull-push-ai.firebaseapp.com",
  projectId: "pull-push-ai",
  storageBucket: "pull-push-ai.appspot.com",
  messagingSenderId: "160707453652",
  appId: "1:160707453652:web:1783fe97d151dcc0a25141"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Добавляем экспорт storage