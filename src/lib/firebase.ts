import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDoc } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(config) : getApp();

export const auth = getAuth(app);

// Use named firestore database ID from configuration with robust auto-detect long-polling
let firestoreDb;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    config.firestoreDatabaseId || undefined
  );
} catch {
  firestoreDb = config.firestoreDatabaseId
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreDb;

// Test Firestore connection gracefully without triggering blocking network errors
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const docRef = doc(db, 'shops', 'init');
    await getDoc(docRef);
    return true;
  } catch {
    return false;
  }
}
