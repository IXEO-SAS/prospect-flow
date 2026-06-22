# 🚀 QUICK START - ProspectFlow

## En 3 étapes, c'est live

### 1️⃣ Installation (2 min)

```bash
cd prospect-app
npm install
npm run dev
```

Ouvrir : http://localhost:5173

### 2️⃣ Test immédiat (1 min)

Cliquez "Démo rapide" → Choisissez Marie (Commercial) ou Luc (Manager).

**Les données de test** :
- 0 contacts au départ (localStorage vide)
- Importez votre fichier XLSX via le dashboard manager
- Tout s'ajoute automatiquement

### 3️⃣ Déployer sur Vercel (1 min)

```bash
npm i -g vercel
vercel login
vercel
```

**URL finale** : `https://prospect-[randomid].vercel.app`

---

## Fichier de test XLSX

Pour tester l'import, créez un fichier Excel simple :

| RAISON SOCIALE | DIRIGEANT | ADRESSE | TEL | CODE_NAF | LIBELLE_NAF |
|---|---|---|---|---|---|
| Acme Corp | Jean Doe | 123 Rue de Paris, 75001 Paris | 01.23.45.67.89 | 5829A | Repair |
| Beta Ltd | Marie Foo | 456 Avenue Lyon, 69000 Lyon | 04.12.34.56.78 | 6202A | IT |
| Gamma SA | Pierre Bar | 789 Boulevard Marseille, 13000 Marseille | 04.91.12.34.56 | 7420Z | Other |

→ Sauvegardez en **.xlsx** et importez depuis le dashboard manager.

---

## Architecture succincte

```
src/
├── components/
│   ├── LoginPage.jsx          # Connexion
│   ├── CommercialDashboard.jsx # Dashboard commercial
│   ├── ManagerDashboard.jsx     # Dashboard manager
│   ├── ImportContacts.jsx       # Import XLSX + mapping
│   ├── ContactDetail.jsx        # Fiche contact (6 onglets)
│   ├── ProspectionCampaign.jsx  # Campagne rayon geo
│   ├── MapView.jsx              # Carte Leaflet
│   └── Notifications.jsx        # Système notifications
├── store.js                 # Zustand (état app)
├── utils.js                 # Géolocalisation + distance
├── xlsxUtils.js             # Import XLSX
└── App.jsx                  # App principale
```

---

## Points clés

✅ **Gratuit** : Vercel + localStorage + Nominatim = 0€  
✅ **Responsive** : Mobile + Tablet + Desktop  
✅ **Rapide** : ~230KB gzipped, chargement <1s  
✅ **Pas de config** : Aucune clé API nécessaire (v1)  
✅ **Extensible** : Prêt pour Supabase (Phase 2)

---

## À venir (Phase 2)

- Supabase (cloud sync)
- Export PDF/CSV
- Notifications push
- API REST

---

## Commandes npm

```bash
npm run dev      # Dev server
npm run build    # Build production
npm run preview  # Prévisualiser la build
```

---

**ProspectFlow 1.0** — Prêt à l'emploi 🎉
