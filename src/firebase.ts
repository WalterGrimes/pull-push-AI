// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Добавляем auth
// import { getAnalytics } from "firebase/analytics"; // можно убрать, если не нужен

const firebaseConfig = {
  apiKey: "AIzaSyBXWBVDoIwS5kOBKDF90BrEcR8M32Cv7m0",
  authDomain: "pull-push-ai.firebaseapp.com",
  projectId: "pull-push-ai",
  storageBucket: "pull-push-ai.firebasestorage.app",
  messagingSenderId: "160707453652",
  appId: "1:160707453652:web:1783fe97d151dcc0a25141",
  measurementId: "G-Z4ZZ1T3MQY"
};

// Инициализация
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // не нужен для регистрации
export const auth = getAuth(app); // экспортируем auth
 