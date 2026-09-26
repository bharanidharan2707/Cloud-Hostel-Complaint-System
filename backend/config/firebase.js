const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

try {
    initializeApp({
        credential: cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized successfully.');
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}

const db = getFirestore();

module.exports = { db };
