# ProspectFlow 🚀

Application web de gestion de campagnes de prospection commerciale - **100% gratuite, déployée sur Vercel + localStorage**.

## Caractéristiques

### 👥 Deux rôles utilisateur

**Commerciaux** :
- 🗺️ Dashboard avec vue carte et liste
- 📍 Lancer des campagnes de prospection par rayon géographique
- 📋 Fiches contacts détaillées (infos, intérêts, historique, actions)
- 📱 Responsive mobile

**Managers** :
- 📊 Statistiques en temps réel par commercial
- 📥 Import en masse de contacts XLSX (avec mapping flexible)
- 👥 Gestion équipes et suivi des campagnes
- 📈 KPIs globaux

### 📁 Import de contacts

- Choisir un fichier XLSX
- Mapper automatiquement ou manuellement les colonnes
- Géocodage gratuit via Nominatim (OpenStreetMap)
- Support des formats : RAISON SOCIALE | DIRIGEANT | ADRESSE | TEL | CODE_NAF | LIBELLE_NAF

### 🎯 Campagnes de prospection

1. Choisir un contact de départ
2. Définir un rayon (1 à 50 km)
3. Obtenir la liste des contacts triés par distance
4. Suivre la prospection en direct

### 📊 Fiches contact (6 onglets)

- **Infos** : Données essentielles
- **Intérêts** : Checkboxes (Impression, Informatique, Sauvegarde, M365, GED, Affichage, Écran tactile)
- **Contacts** : Tableau des interlocuteurs
- **Historique** : Équipements/solutions existantes
- **Actions** : Tableau d'actions (appels, visites, emails)
- **Statut** : Non contacté (🔴) / Contacté (🟠) / Action (🟢)

## Installation

```bash
npm install
npm run dev
```

## Déploiement Vercel (rapide)

```bash
npm i -g vercel
vercel
```

## Structure

- `/src/components` : Composants React
- `/src/store.js` : Zustand (état)
- `/src/utils.js` : Géolocalisation, distance
- `/src/xlsxUtils.js` : Import XLSX

## Stack

- React 18 + Vite
- Zustand (state)
- Leaflet (cartes)
- SheetJS (import XLSX)
- Tailwind CSS
- localStorage (v1)

---

**ProspectFlow v1.0** • Juin 2026
