import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUkZI9kBHlcGVSaq5DqoZrxGKoTTsiSFE",
  authDomain: "city-iq-final.firebaseapp.com",
  projectId: "city-iq-final",
  storageBucket: "city-iq-final.firebasestorage.app",
  messagingSenderId: "965354169805",
  appId: "1:965354169805:web:4361ec4354415cb7f69084",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export default app;

