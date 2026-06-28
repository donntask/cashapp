import { initializeApp, getApps, getApp as _getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

function buildConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function app(): FirebaseApp {
  if (_app) return _app;
  const existing = getApps();
  if (existing.length > 0) { _app = existing[0]; return _app; }
  _app = initializeApp(buildConfig());
  return _app;
}

/** Returns the real Firestore instance. Call this at the usage site. */
export function getDb(): Firestore {
  if (!_db) _db = getFirestore(app());
  return _db;
}

/** Returns the real Auth instance. Call this at the usage site. */
export function getAuthInstance(): Auth {
  if (!_auth) _auth = getAuth(app());
  return _auth;
}
