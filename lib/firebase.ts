/**
 * Firebase initialization module for Civic Copilot.
 *
 * Initializes Firebase App and Realtime Database using environment variables.
 * All config values are sourced from NEXT_PUBLIC_ env vars so they are
 * available in both server and client contexts.
 *
 * @module lib/firebase
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

/**
 * Firebase configuration object populated from environment variables.
 * None of these values are secrets — they are safe to expose client-side.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? '',
};

/**
 * Singleton Firebase App instance.
 * Re-uses existing app if already initialised (important for HMR).
 */
const app: FirebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

/**
 * Firebase Realtime Database instance bound to the app.
 */
const db: Database = getDatabase(app);

export { app, db };
