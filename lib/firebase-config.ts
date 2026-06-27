import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not set');
  }

  return initializeApp({
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

// Lazy singleton getters — initialization deferred to first runtime call
export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getAuthInstance(): Auth {
  return getAuth(getFirebaseApp());
}

// Backward-compatible named exports used throughout the codebase
export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return (getAuthInstance() as any)[prop];
  },
});

export default { db, auth };
