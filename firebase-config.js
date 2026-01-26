// ============================================
// CONFIGURATION FIREBASE
// ============================================

// IMPORTANT: Remplacez ces valeurs par celles de votre projet Firebase
// Pour obtenir ces informations:
// 1. Allez sur https://console.firebase.google.com/
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Cliquez sur l'icône Web (</>) pour ajouter une application web
// 4. Copiez la configuration qui vous est fournie

const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://VOTRE_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "VOTRE_PROJECT_ID",
    storageBucket: "VOTRE_PROJECT_ID.appspot.com",
    messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
    appId: "VOTRE_APP_ID"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Référence à la base de données
const database = firebase.database();

console.log('Firebase initialisé avec succès !');
