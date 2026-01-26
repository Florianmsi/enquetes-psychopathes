# ENQUÊTES ET PSYCHOPATHES 🔍☠️

Site web de suivi de progression dans un jeu d'enquêtes criminelles avec une ambiance polar noir immersive.

## 📋 Contenu du projet

- `index.html` - Page principale du site
- `styles.css` - Styles avec ambiance film noir
- `app.js` - Logique de l'application
- `firebase-config.js` - Configuration Firebase (à configurer)
- `README.md` - Ce fichier

## 🚀 Installation et Déploiement

### Étape 1 : Configuration Firebase

1. **Créer un projet Firebase**
   - Allez sur https://console.firebase.google.com/
   - Cliquez sur "Ajouter un projet"
   - Suivez les étapes (nommez votre projet, désactivez Google Analytics si vous le souhaitez)

2. **Ajouter une application Web**
   - Dans votre projet Firebase, cliquez sur l'icône Web `</>`
   - Donnez un nom à votre application (ex: "Enquêtes et Psychopathes")
   - Cochez "Configurer Firebase Hosting" si vous voulez héberger sur Firebase
   - Cliquez sur "Enregistrer l'application"

3. **Copier la configuration**
   - Firebase vous fournira un objet de configuration
   - Ouvrez le fichier `firebase-config.js`
   - Remplacez les valeurs par celles fournies par Firebase

4. **Activer Realtime Database**
   - Dans la console Firebase, allez dans "Realtime Database"
   - Cliquez sur "Créer une base de données"
   - Choisissez "Démarrer en mode test" (ou configurez les règles de sécurité)
   - Cliquez sur "Activer"

5. **Configurer les règles de sécurité** (recommandé)
   - Dans l'onglet "Règles" de Realtime Database, remplacez le contenu par :
   ```json
   {
     "rules": {
       "users": {
         "$pseudo": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```
   - Cliquez sur "Publier"

### Étape 2 : Déployer sur GitHub Pages

#### Option A : Déploiement manuel

1. **Créer un repository sur GitHub**
   - Allez sur https://github.com/
   - Cliquez sur "New repository"
   - Nommez-le (ex: "enquetes-psychopathes")
   - Choisissez "Public"
   - Ne cochez PAS "Add a README file"
   - Cliquez sur "Create repository"

2. **Uploader les fichiers**
   - Sur la page de votre nouveau repository, cliquez sur "uploading an existing file"
   - Glissez-déposez TOUS les fichiers :
     - index.html
     - styles.css
     - app.js
     - firebase-config.js (avec votre configuration)
     - README.md
   - Ajoutez un message de commit (ex: "Initial commit")
   - Cliquez sur "Commit changes"

3. **Activer GitHub Pages**
   - Dans votre repository, allez dans "Settings"
   - Dans le menu de gauche, cliquez sur "Pages"
   - Sous "Source", sélectionnez "main" et "/" (root)
   - Cliquez sur "Save"
   - Attendez quelques minutes, votre site sera accessible à : `https://VOTRE-USERNAME.github.io/NOM-DU-REPO/`

#### Option B : Déploiement via ligne de commande (Git)

1. **Initialiser Git localement**
   ```bash
   cd chemin/vers/votre/dossier
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Connecter à GitHub**
   ```bash
   git remote add origin https://github.com/VOTRE-USERNAME/NOM-DU-REPO.git
   git branch -M main
   git push -u origin main
   ```

3. **Activer GitHub Pages** (voir étape 3 de l'Option A)

### Étape 3 : Vérification

1. Attendez 2-3 minutes après l'activation de GitHub Pages
2. Accédez à votre site : `https://VOTRE-USERNAME.github.io/NOM-DU-REPO/`
3. Testez la création d'un pseudo et la saisie de scores

## 🎨 Fonctionnalités

### Authentification
- ✅ Connexion par pseudo unique (sans mot de passe)
- ✅ Vérification en temps réel de la disponibilité
- ✅ Reconnexion automatique pour les utilisateurs existants

### Chapitres
- ✅ 7 chapitres avec scores différenciés
- ✅ Validation définitive (pas de modification après validation)
- ✅ Affichage des statistiques par chapitre
- ✅ Comparaison avec la moyenne des joueurs

### Bonus
- ✅ Questionnaire de 10 questions (10 points bonus)
- ✅ Accessible après avoir complété les 7 chapitres
- ✅ Réponses verrouillées après sélection
- ✅ Progression sauvegardée

### Classement
- ✅ Top 10 des meilleurs joueurs
- ✅ Affichage du nombre total de joueurs
- ✅ Mise en évidence du joueur connecté
- ✅ Mise à jour en temps réel

### Design
- ✅ Ambiance polar noir / film noir
- ✅ Bandes de scène de crime animées
- ✅ Effets de grain vintage
- ✅ Typographie style machine à écrire
- ✅ Animations et effets lumineux
- ✅ Responsive (mobile, tablette, desktop)

## 🛠️ Technologies utilisées

- **HTML5** - Structure
- **CSS3** - Styles et animations
- **JavaScript (Vanilla)** - Logique
- **Firebase Realtime Database** - Base de données temps réel
- **Google Fonts** - Typographies (Bebas Neue, Courier Prime, Special Elite)

## 📱 Responsive

Le site est entièrement responsive et s'adapte à :
- 📱 Smartphones (portrait et paysage)
- 💻 Tablettes
- 🖥️ Ordinateurs de bureau

## 🔧 Personnalisation

### Modifier les chapitres
Éditez le tableau `CHAPTERS_CONFIG` dans `app.js` :
```javascript
const CHAPTERS_CONFIG = [
    {
        number: 1,
        title: "Votre titre",
        difficulty: 2.5,
        maxPoints: 10,
        possibleValues: [0, 5, 10]
    },
    // ...
];
```

### Modifier le questionnaire bonus
Éditez le tableau `QUIZ_QUESTIONS` dans `app.js` :
```javascript
const QUIZ_QUESTIONS = [
    {
        question: "Votre question ?",
        options: [
            "A) Réponse 1",
            "B) Réponse 2",
            "C) Réponse 3"
        ],
        correct: 0  // Index de la bonne réponse (0, 1 ou 2)
    },
    // ...
];
```

### Modifier les couleurs
Éditez les variables CSS dans `styles.css` :
```css
:root {
    --noir-profond: #0a0a0a;
    --jaune-vif: #f4c430;
    --rouge-sang: #8b0000;
    /* ... */
}
```

## 🐛 Dépannage

### Le site ne s'affiche pas
- Vérifiez que GitHub Pages est activé dans les Settings
- Attendez 2-3 minutes après l'activation
- Vérifiez l'URL (doit être en minuscules)

### Erreur Firebase
- Vérifiez que vous avez bien remplacé les valeurs dans `firebase-config.js`
- Vérifiez que Realtime Database est activé dans Firebase
- Vérifiez les règles de sécurité de la database

### Les scores ne se sauvegardent pas
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs Firebase
- Vérifiez les règles de sécurité de la database

### Le pseudo n'est pas vérifié
- Vérifiez que la databaseURL est correcte dans `firebase-config.js`
- Vérifiez que vous avez une connexion internet
- Vérifiez les règles de lecture dans Firebase

## 📝 Notes importantes

- ⚠️ **Pas de mot de passe** : Les utilisateurs s'identifient uniquement par leur pseudo
- ⚠️ **Scores définitifs** : Une fois validés, les scores ne peuvent plus être modifiés
- ⚠️ **Temps réel** : Toutes les statistiques et le classement se mettent à jour en temps réel
- ⚠️ **Mode test Firebase** : N'oubliez pas de configurer des règles de sécurité appropriées pour la production

## 🎯 Score maximum possible

- 7 chapitres : 110 points maximum
- Questionnaire bonus : 10 points
- **TOTAL : 120 points maximum**

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez la console du navigateur (F12 → Console)
2. Vérifiez la console Firebase (section Database)
3. Relisez attentivement les étapes de configuration

## 📄 Licence

Projet libre d'utilisation et de modification.

---

**Bon courage détective ! 🔍**
