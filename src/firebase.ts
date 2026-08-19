import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyApYNhvobdQYmNWavDnasS1xRq1zlNcKoo",
  authDomain: "hacktes-pos-software.firebaseapp.com",
  projectId: "hacktes-pos-software",
  storageBucket: "hacktes-pos-software.firebasestorage.app",
  messagingSenderId: "663959563883",
  appId: "1:663959563883:web:0ba54bdc5e5f2e889e4b2e",
  measurementId: "G-Y622WPRG3J"
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Analytics safely
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully for hacktes-pos-software');
    }
  }).catch((err) => {
    console.warn('Firebase Analytics initialization skipped:', err);
  });
}
