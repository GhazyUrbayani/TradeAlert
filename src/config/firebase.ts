import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

/**
 * FIREBASE SETUP - TradeAlert SEA
 * 
 * In development (AI Studio), we default to the auto-generated config.
 * In production/manual setup, use environment variables.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "REPLACE_ME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "REPLACE_ME",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "REPLACE_ME",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "REPLACE_ME",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "REPLACE_ME",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "REPLACE_ME"
};

// Check if configuration is actually missing (true placeholders)
const configValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId
];
const isConfigMissing = configValues.some(val => val === "REPLACE_ME" || !val);

if (isConfigMissing && import.meta.env.PROD) {
  console.warn("Firebase configuration is missing or incomplete. Some features may not work.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (appletConfig as any).firestoreDatabaseId || "(default)");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test as required by guidelines
async function testConnection() {
  if (isConfigMissing) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

testConnection();

export const signInWithGoogle = async () => {
  if (isConfigMissing) {
    alert("Firebase not configured. Please see README for setup instructions.");
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logout = () => auth.signOut();
