import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMY3b9vlkUtOXFbyQSZfpvY1jVIVn-f0Y",
  authDomain: "questionmaker-ddc69.firebaseapp.com",
  projectId: "questionmaker-ddc69",
  storageBucket: "questionmaker-ddc69.firebasestorage.app",
  messagingSenderId: "172727427709",
  appId: "1:172727427709:web:09c15e524a0c47ca724714",
  measurementId: "G-4V8DS7LC7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);