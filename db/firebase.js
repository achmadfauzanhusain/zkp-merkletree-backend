const { initializeApp } = require("firebase/app");
const { getFirestore, collection } = require("firebase/firestore");
const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId } = require("../config/index.js")

const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId

}

initializeApp(firebaseConfig);
const db = getFirestore();
const colUser = collection(db, "users");

module.exports = { db, colUser }