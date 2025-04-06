// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDMtmzo7y2HldBgcyfecbytCPArimCf1aU',
  authDomain: 'aceprepai.firebaseapp.com',
  projectId: 'aceprepai',
  storageBucket: 'aceprepai.firebasestorage.app',
  messagingSenderId: '682977303151',
  appId: '1:682977303151:web:4b92c40f26d5b3d1800b9a',
  measurementId: 'G-55V06M2ZVZ',
};

// Initialize Firebase
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
