import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection to Firestore
async function testConnection() {
  try {
    // Attempt to fetch a non-existent document from the server to test connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection successful: Reached backend.");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.log("Firestore connection successful: Reached backend (Permission Denied as expected for unauthenticated test).");
      return;
    }
    
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("Firestore Connection Error: Could not reach the backend. This may be due to an incorrect firestoreDatabaseId, the database not being provisioned yet, or a temporary network issue.", {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        errorCode: error.code,
        errorMessage: error.message
      });
    } else {
      console.error("Unexpected Firestore Error during connection test:", error);
    }
    // We don't throw here to avoid crashing the whole app, just log the status
  }
}

testConnection();

export default app;
