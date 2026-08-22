import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
  where,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCGX6XsXTh-JS2S5fSwq3_enwdvp1cXkOM",
  authDomain: "limo-pos.firebaseapp.com",
  projectId: "limo-pos",
  storageBucket: "limo-pos.firebasestorage.app",
  messagingSenderId: "760819692733",
  appId: "1:760819692733:web:dd7f3de80af8797f6d33d4",
  measurementId: "G-FDLRVLFHQY"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore
export const db: Firestore = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firebase Analytics safely
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully for limo-pos');
    }
  }).catch((err) => {
    console.warn('Firebase Analytics initialization skipped:', err);
  });
}

// Export Auth helpers
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
};

// Export Firestore helpers
export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
  where
};

export type { User, Firestore };
