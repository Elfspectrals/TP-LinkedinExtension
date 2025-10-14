# 🔗 LinkedIn Profile Extractor

Extension Chrome qui extrait automatiquement les profils LinkedIn et les sauvegarde dans Supabase.

## 📋 Fonctionnalités

- ✅ Extraction des profils LinkedIn (nom, poste, abonnés, relations, expériences, formations, compétences)
- ✅ Sauvegarde automatique dans Supabase
- ✅ Interface popup simple et intuitive
- ✅ Extraction manuelle via bouton

## 🚀 Installation rapide

### 1. Créer votre projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet
2. Dans l'éditeur SQL, copiez-collez le contenu du fichier `supabase-table.sql` et exécutez-le
3. Récupérez votre **Project URL** et **anon key** dans `Settings > API`

### 2. Configuration de l'extension

1. Ouvrez le fichier `supabase.js`
2. Remplacez ces valeurs par les vôtres :
   ```javascript
   const SUPABASE_URL = "https://your-project-id.supabase.co";
   const SUPABASE_ANON_KEY = "your_supabase_anon_key_here";
   ```

### 3. Installation dans Chrome

1. Ouvrez Chrome → `chrome://extensions/`
2. Activez le **"Mode développeur"** (toggle en haut à droite)
3. Cliquez sur **"Charger l'extension non empaquetée"**
4. Sélectionnez le dossier `TP-LinkedinExtension`
5. ✅ L'extension apparaît dans votre barre d'outils !

## 🎯 Utilisation

1. **Allez sur un profil LinkedIn** (n'importe lequel)
2. **Cliquez sur l'icône de l'extension** dans la barre d'outils Chrome
3. **Cliquez sur "💾 Extraire et sauvegarder"**
4. ✅ **Les données sont automatiquement sauvegardées dans Supabase !**

### 👁️ Voir vos données

- **Dans Supabase** : Allez dans `Table Editor` → `linkedin_profiles`
- **Ou via l'extension** : Cliquez sur "👁️ Voir les données extraites"

## 📊 Données extraites

L'extension extrait :

- **Nom et prénom** du profil
- **Poste actuel**
- **Nombre d'abonnés**
- **Nombre de relations**
- **Expériences professionnelles** (poste + entreprise)
- **Certifications et formations**
- **Nombre de compétences**

## 🔧 Structure des fichiers

```
TP-LinkedinExtension/
├── manifest.json          # Configuration de l'extension
├── content.js             # Script d'extraction des profils
├── supabase.js           # Configuration et client Supabase
├── popup.html            # Interface utilisateur
├── popup.js              # Logique du popup
├── package.json          # Dépendances du projet
└── README.md             # Ce fichier
```

## 🛠️ Développement

### Modification du code

1. Modifiez les fichiers selon vos besoins
2. Allez sur `chrome://extensions/`
3. Cliquez sur le bouton "Recharger" de votre extension
4. Testez sur LinkedIn

### Débogage

- Ouvrez la console développeur sur LinkedIn (F12)
- Les logs d'extraction apparaissent dans la console
- Vérifiez les erreurs dans l'onglet "Extensions" de Chrome

## 🔧 Structure du projet

```
TP-LinkedinExtension/
├── manifest.json          # Configuration de l'extension Chrome
├── content.js             # Script d'extraction des profils LinkedIn
├── supabase.js           # Client Supabase (⚠️ configurez vos clés ici)
├── popup.html            # Interface utilisateur
├── popup.js              # Logique du popup
├── supabase-table.sql    # Script SQL pour créer la table
└── README.md             # Ce fichier
```

## 📝 Notes importantes

- ⚠️ **Respectez les conditions d'utilisation de LinkedIn**
- 🔒 **Ne partagez jamais votre clé API Supabase publiquement**
- 🚀 **L'extension fonctionne uniquement sur les pages de profil LinkedIn**
- 💾 **Sauvegarde manuelle uniquement** (cliquez sur le bouton pour sauvegarder)

## 🎉 C'est parti !

Votre extension LinkedIn est maintenant prête à extraire et sauvegarder des profils dans Supabase !

**Bon scraping ! 🚀**
