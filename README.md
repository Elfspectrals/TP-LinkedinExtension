# 🔗 LinkedIn Profile Extractor

Extension Chrome qui extrait automatiquement les profils LinkedIn et les sauvegarde dans Supabase.

## 📋 Fonctionnalités

- ✅ Extraction automatique des profils LinkedIn
- ✅ Sauvegarde dans Supabase
- ✅ Interface popup intuitive
- ✅ Configuration facile de l'API Supabase

## 🚀 Installation

### 1. Configuration Supabase

1. Allez sur votre [dashboard Supabase](https://supabase.com/dashboard/project/elxsbvnkiemuzyeemefm)
2. Créez la table `linkedin_profiles` avec cette requête SQL :

```sql
CREATE TABLE linkedin_profiles (
  id BIGSERIAL PRIMARY KEY,
  nom_prenom TEXT,
  poste_actuel TEXT,
  nombre_abonnes TEXT,
  nombre_relations TEXT,
  experiences_professionnelles JSONB,
  certifications_formations JSONB,
  nombre_competences INTEGER,
  url_profil TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Récupérez votre clé API dans `Settings > API` (anon/public key)

### 2. Configuration de l'extension

1. Ouvrez le fichier `supabase.js`
2. Remplacez `VOTRE_ANON_KEY_ICI` par votre vraie clé API Supabase

### 3. Installation dans Chrome

1. Ouvrez Chrome et allez sur `chrome://extensions/`
2. Activez le "Mode développeur" (en haut à droite)
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier de cette extension
5. L'extension apparaît dans la barre d'outils Chrome

## 🎯 Utilisation

### Méthode automatique

1. Allez sur n'importe quel profil LinkedIn
2. L'extension extrait automatiquement les données après 3 secondes
3. Les données sont sauvegardées dans Supabase

### Méthode manuelle

1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Configurez votre clé API Supabase (une seule fois)
3. Cliquez sur "Extraire le profil actuel"
4. Visualisez les données avec "Voir les données extraites"

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

## 📝 Notes importantes

- ⚠️ Respectez les conditions d'utilisation de LinkedIn
- 🔒 Gardez votre clé API Supabase secrète
- 🚀 L'extension fonctionne uniquement sur les pages de profil LinkedIn
- 💾 Les données sont sauvegardées automatiquement dans Supabase

## 🎉 Prêt à utiliser !

Votre extension LinkedIn est maintenant configurée et prête à extraire des profils !
