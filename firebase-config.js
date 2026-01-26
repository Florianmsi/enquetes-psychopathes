// ============================================
// CONFIGURATION FIREBASE
// ============================================

// Configuration Firebase pour le projet "enquetes-psychopathes"
// Ce fichier contient vos identifiants Firebase

const firebaseConfig = {
  apiKey: "AIzaSyDdBKmtP94_ym_mhoLAn5SeqHhI-Cc5yD0",
  authDomain: "enquetes-psychopathes.firebaseapp.com",
  databaseURL: "https://enquetes-psychopathes-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "enquetes-psychopathes",
  storageBucket: "enquetes-psychopathes.firebasestorage.app",
  messagingSenderId: "638717751283",
  appId: "1:638717751283:web:9bf9ea32458c46e933ac86"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Référence à la base de données
const database = firebase.database();

console.log('Firebase initialisé avec succès !');
