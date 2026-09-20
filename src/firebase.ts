import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: appletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: appletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: appletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: appletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: appletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: appletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = initializeFirestore(
  app,
  {},
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined
);

export const rawFirebaseConfig = firebaseConfig;
