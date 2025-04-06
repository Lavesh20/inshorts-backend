// const admin = require('firebase-admin');

// const serviceAccount = JSON.parse(
//   Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8")
// );

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// console.log("✅ Firebase Admin initialized");


// module.exports = admin;

// config/firebase.js
const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

let serviceAccount;

try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8")
  );
} catch (error) {
  console.error("🚨 Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
  throw error;
}

// Avoid reinitializing if already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized");
}

module.exports = admin;
