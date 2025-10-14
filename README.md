# 🔗 LinkedIn Profile Extractor v2.0

Extension Chrome avancée qui extrait intelligemment les profils LinkedIn avec une interface moderne et des fonctionnalités professionnelles.

## ✨ Fonctionnalités principales

### 🎯 Extraction intelligente

- ✅ Extraction automatique des profils LinkedIn (nom, poste, abonnés, relations, expériences, formations, compétences)
- ✅ Algorithme d'extraction robuste avec sélecteurs multiples et fallbacks
- ✅ Cache intelligent pour optimiser les performances
- ✅ Extraction automatique lors de la navigation (configurable)
- ✅ Queue de traitement pour les extractions en lot

### 🎨 Interface moderne

- ✅ Design moderne avec dégradés et animations
- ✅ Interface popup responsive et intuitive
- ✅ Page d'options avancées complète
- ✅ Statistiques en temps réel
- ✅ Notifications système

### 💾 Gestion des données

- ✅ Sauvegarde automatique dans Supabase
- ✅ Stockage local pour les statistiques
- ✅ Export CSV/JSON des données
- ✅ Import de données existantes
- ✅ Visualisation améliorée des données extraites

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

### Extraction manuelle

1. **Allez sur un profil LinkedIn** (n'importe lequel)
2. **Cliquez sur l'icône de l'extension** dans la barre d'outils Chrome
3. **Cliquez sur "💾 Extraire et sauvegarder"**
4. ✅ **Les données sont automatiquement sauvegardées dans Supabase !**

### Extraction automatique

1. **L'extraction automatique est activée par défaut**
2. **Naviguez normalement sur LinkedIn**
3. ✅ **Les profils sont extraits automatiquement !**

### 👁️ Voir vos données

- **Interface améliorée** : Cliquez sur "👁️ Voir les données extraites" pour une vue stylée
- **Dans Supabase** : Allez dans `Table Editor` → `linkedin_profiles`
- **Export** : Utilisez "📊 Exporter en CSV" pour télécharger vos données
- **Statistiques** : Consultez les stats en temps réel dans le popup

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
├── manifest.json              # Configuration de l'extension Chrome
├── content-refactored.js      # 🆕 Script d'extraction intelligent (version 2.0)
├── content.js                 # Script d'extraction original (legacy)
├── supabase.js               # Configuration et client Supabase
├── popup.html                # 🎨 Interface utilisateur moderne
├── popup.js                  # 🎨 Logique du popup améliorée
├── package.json              # Dépendances du projet
├── supabase-table.sql        # Script SQL pour créer la table
└── README.md                 # Documentation complète
```

### 🆕 Nouveaux fichiers v2.0

- **`content-refactored.js`** : Version refactorisée avec classes, cache intelligent et extraction optimisée

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

## 🆕 Nouvelles fonctionnalités v2.0

### 🎨 Interface utilisateur

- **Design moderne** avec dégradés et animations CSS
- **Statistiques en temps réel** (profils extraits, extractions du jour)
- **Boutons avec effets visuels** et badges "Nouveau"/"Pro"
- **Interface responsive** et professionnelle

### 🧠 Extraction intelligente

- **Architecture orientée objet** avec classes `LinkedInExtractor` et `LinkedInObserver`
- **Cache intelligent** pour éviter les extractions redondantes
- **Sélecteurs multiples** avec système de fallback robuste
- **Validation des données** extraites
- **Métadonnées d'extraction** (temps, ID, cache hits)

### ⚙️ Fonctionnalités avancées

- **Extraction automatique** lors de la navigation
- **Export** de données en CSV
- **Statistiques** en temps réel dans le popup

### 🔧 Améliorations techniques

- **Gestion d'erreurs** robuste
- **Observer optimisé** pour détecter les changements de page
- **Stockage local** pour les statistiques
- **Nettoyage automatique** des ressources

## 📝 Notes importantes

- ⚠️ **Respectez les conditions d'utilisation de LinkedIn**
- 🔒 **Ne partagez jamais votre clé API Supabase publiquement**
- 🚀 **L'extension fonctionne sur toutes les pages LinkedIn** (extraction automatique configurable)
- 💾 **Sauvegarde automatique ET manuelle** disponibles
- 🎯 **Extraction intelligente** avec détection automatique des profils
- 📊 **Statistiques et monitoring** intégrés

## 🎉 Votre extension LinkedIn v2.0 est prête !

### Fonctionnalités disponibles immédiatement :

✅ Extraction manuelle et automatique  
✅ Interface moderne avec statistiques  
✅ Export CSV des données  
✅ Cache intelligent

### Fonctionnalités en développement :

🚧 Configuration avancée personnalisable  
🚧 Extraction en lot depuis les résultats de recherche  
🚧 Intégration API LinkedIn officielle  
🚧 Analyse et insights des données

**Bon scraping intelligent ! 🚀✨**
