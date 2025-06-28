// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2wdyq0ee71mJnEoR4LTUVU4ZM8l3WbmQ",
  authDomain: "joingroup-4f370.firebaseapp.com",
  projectId: "joingroup-4f370",
  storageBucket: "joingroup-4f370.firebasestorage.app",
  messagingSenderId: "174176466337",
  appId: "1:174176466337:web:acffd9deb692435bd847e0",
  measurementId: "G-RLCYHWX67L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
