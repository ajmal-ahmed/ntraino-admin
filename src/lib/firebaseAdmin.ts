import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let adminDb: Firestore;

function getAdminApp(): App {
  if (getApps().length === 0) {
    // Use service account credentials from environment variables
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      const parsed = JSON.parse(serviceAccount);
      app = initializeApp({
        credential: cert(parsed),
      });
    } else {
      // Fallback: use application default credentials (for local dev with gcloud CLI)
      app = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    app = getApps()[0];
  }
  return app;
}

function getAdminDb(): Firestore {
  if (!adminDb) {
    const adminApp = getAdminApp();
    adminDb = getFirestore(adminApp);
  }
  return adminDb;
}

export { getAdminApp, getAdminDb };
