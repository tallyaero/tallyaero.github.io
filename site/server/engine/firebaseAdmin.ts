/**
 * Firebase Admin SDK initialization
 * Used for server-side auth token verification and Firestore access
 */

import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // In dev, use application default credentials or service account
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount);
      app = initializeApp({ credential: cert(parsed) });
    } catch {
      // Fall back to default credentials
      app = initializeApp();
    }
  } else {
    // Use GOOGLE_APPLICATION_CREDENTIALS or emulator
    app = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'aeroedge-logbook' });
  }

  return app;
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
