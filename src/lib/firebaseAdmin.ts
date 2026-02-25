import admin from "firebase-admin";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length && serviceAccountJson) {
  const credentials =
    typeof serviceAccountJson === "string"
      ? JSON.parse(serviceAccountJson)
      : serviceAccountJson;

  admin.initializeApp({
    credential: admin.credential.cert(credentials as admin.ServiceAccount),
  });
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminFieldValue = admin.firestore.FieldValue;

