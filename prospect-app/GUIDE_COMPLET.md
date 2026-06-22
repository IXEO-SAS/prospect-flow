# 🚀 GUIDE COMPLET - ProspectFlow

## INSTALLATION LOCALE (2 minutes)

### 1. Prérequis
- Node.js 16+ ([installer](https://nodejs.org))
- npm (inclus avec Node.js)

### 2. Setup

```bash
# Allez dans le dossier
cd prospect-app

# Installez les dépendances
npm install

# Lancez l'app en dev
npm run dev
```

→ Ouvrez `http://localhost:5173` dans votre navigateur

### 3. Test immédiat

Cliquez sur "Démo rapide" :
- **Marie (Commercial)** - pour tester les campagnes
- **Luc (Manager)** - pour tester l'import et les stats

---

## DÉPLOIEMENT VERCEL (3 minutes)

### Option A : Ligne de commande (plus rapide)

```bash
# Installez Vercel CLI
npm i -g vercel

# Loggez-vous
vercel login

# Déployez
vercel
```

Répondez aux questions, puis visitez l'URL générée.

### Option B : GitHub + Vercel UI (plus durable)

1. **Push sur GitHub**
   ```bash
   git remote add origin https://github.com/VOUS/prospect-app.git
   git push -u origin main
   ```

2. **Allez sur https://vercel.com**

3. **Connectez votre compte GitHub**

4. **Importez le repo**
   - Cliquez "New Project"
   - Sélectionnez `prospect-app`
   - Cliquez "Deploy"

5. **URL de prod** : `https://prospect-[random].vercel.app` ✅

### Option C : Déployer sur votre domaine

Sur Vercel, allez dans Settings > Domains et ajoutez votre domaine.

---

## UTILISATION

### Pour les COMMERCIAUX

**Avant de commencer** : Un manager doit avoir importé des contacts.

#### 1️⃣ Lancer une campagne

1. Connectez-vous en tant que commercial
2. Allez sur le **Dashboard**
3. Cliquez **"Nouvelle campagne"**
4. Sélectionnez un contact de départ (ex: entreprise X)
5. Définissez un rayon (ex: 5 km)
6. Validez → Obtenez la liste de prospection triée par distance ✅

#### 2️⃣ Prospecter un contact

- **Vue Liste** : Cliquez sur un contact pour ouvrir sa fiche
- **Vue Carte** : Cliquez sur une épingle pour voir les infos

#### 3️⃣ Gérer un contact (Fiche)

Dans la fiche, vous avez 6 onglets :

| Onglet | Description | Actions |
|--------|-------------|---------|
| **Infos** | Données essentielles | Modifier contact, changer statut |
| **Intérêts** | Domaines d'intérêt | Cocher les intérêts détectés |
| **Contacts** | Interlocuteurs projet | Ajouter/supprimer contacts |
| **Historique** | Équipements existants | Documenter historique |
| **Actions** | Journal prospection | Ajouter appels/visites/emails |
| **Statut** | État du prospect | 🔴 Nouveau / 🟠 Contacté / 🟢 Action |

#### 4️⃣ Suivre en temps réel

- Carte affiche tous vos prospects
- Épingles changent de couleur selon le statut
- Stats au-dessus du dashboard

---

### Pour les MANAGERS

#### 1️⃣ Importer des contacts

1. Connectez-vous en tant que manager
2. Allez dans onglet **"Contacts"**
3. Cliquez **"Importer contacts"**
4. **Étapes d'import** :
   - Sélectionnez votre fichier XLSX
   - Mappez les colonnes (auto-détection)
   - Validez l'aperçu
   - Laissez le géocodage se faire (1-2 min)

**Format attendu** :
```
RAISON SOCIALE | DIRIGEANT | ADRESSE | TEL | CODE_NAF | LIBELLE_NAF
Acme Corp      | Jean Doe  | 123 R X | 01234567 | 5829A | Repair of...
...
```

#### 2️⃣ Consulter les statistiques

Allez dans onglet **"Statistiques"** :
- Voir les appels/visites/emails par commercial
- Identifier les tops performers
- Campagnes actives en cours

#### 3️⃣ Suivre les équipes

Allez dans onglet **"Équipes"** :
- État temps réel de chaque commercial
- Campagnes en cours
- Nombre total d'interactions

#### 4️⃣ Afficher tous les contacts

Onglet **"Contacts"** :
- Tableau des 10 premiers contacts
- Filtrer par statut
- Ouvrir une fiche pour modifier

---

## STRUCTURE FICHIER XLSX

### Colonnes supportées

Votre fichier peut avoir n'importe quelles colonnes. Au moment de l'import, vous mappez manuellement :

```
OBLIGATOIRES :
  - Raison Sociale
  - Dirigeant / Contact
  - Adresse

OPTIONNELS :
  - Téléphone
  - Code NAF
  - Libellé NAF / Secteur
  - Email
  - [autres colonnes ignorées]
```

### Exemple XLSX

| Raison Sociale | Dirigeant | Adresse | Tel | Code NAF | Secteur |
|---|---|---|---|---|---|
| Acme Corp | Jean Doe | 123 Rue X, 75001 Paris | 01.23.45.67.89 | 5829A | Repair... |
| Beta Ltd | Marie Foo | 456 Av Y, 69000 Lyon | 04.12.34.56.78 | 6202A | IT... |

→ À l'import, il suffit d'associer les en-têtes de votre fichier aux 6 champs cibles.

---

## GÉOCODAGE

### Fonctionnement

1. Vous importez : adresse (texte) → **Nominatim** → latitude/longitude
2. Nominatim est gratuit, mais limité à **1 requête/sec**
3. 100 contacts = ~2 minutes

### En cas d'erreur

Si un géocodage échoue :
- Vérifiez l'adresse (complète, sans typo)
- Quelques erreurs sont normales (15-20%)
- Contact importé quand même, mais sans géolocalisation (pas d'épingle sur carte)

### Réessayer le géocodage

Actuellement : supprimez le contact + réimportez-le.

---

## DONNÉES & STOCKAGE

### Où sont les données ?

**v1.0** : LocalStorage de votre navigateur
- Survit aux rechargements de page ✅
- Survit à la fermeture du navigateur ✅
- Supprimé si vous videz le cache ⚠️
- Max ~10 MB par domaine

### Backup/Export

Actuellement : aucune fonction d'export automatique.

À venir (Phase 2) :
- Export CSV / Excel
- Backup cloud sur Supabase

### Reset des données

```js
// Console (F12 > Console)
localStorage.clear()
```

---

## DESIGN & UX

### Couleurs des épingles

| Couleur | Statut | Sens |
|---------|--------|------|
| 🔴 Rouge | Non contacté | À prospecter |
| 🟠 Orange | Contacté (sans suite) | Pas d'intérêt immédiat |
| 🟢 Vert | Action commerciale | Prospect qualifié |

### Cliquer sur un statut dans la fiche

Un clic sur le statut → cycle automatique : **new → contacted → action → new**

---

## PROBLÈMES COURANTS

### Q: "Erreur : Nominatim a échoué"
**R** : Attendez 1-2 min, réessayez. Nominatim peut être saturé.

### Q: "Les contacts n'apparaissent pas sur la carte"
**R** : Vérifiez qu'ils ont été géocodés (lat/lon ≠ null). Si absent, réimportez.

### Q: "Je dois importer 5000 contacts, ça va prendre 2h ?"
**R** : Oui, avec Nominatim gratuit (1 req/sec). Phase 2 utilisera Supabase + API rapide.

### Q: "Puis-je accéder depuis 2 appareils ?"
**R** : Oui, mais chaque navigateur a son localStorage. Phase 2 : Supabase = sync cloud.

### Q: "Puis-je exporter les fiches ?"
**R** : Pas encore. À venir : export PDF + CSV.

---

## FEUILLE DE ROUTE (Phase 2 & 3)

### Phase 2 (Été 2026)
- [ ] Migration Supabase (cloud sync)
- [ ] Authentification multi-utilisateurs
- [ ] Notifications push
- [ ] Export PDF/CSV
- [ ] Rayon custom (dessiner sur la carte)

### Phase 3 (Automne 2026)
- [ ] Intégrations CRM (Pipedrive, HubSpot)
- [ ] Analytics avancées
- [ ] API REST
- [ ] Mobile app natif

---

## CONTACT & SUPPORT

**Problème technique** ?
1. Vérifiez F12 > Console (messages d'erreur)
2. Essayez `localStorage.clear()` + refresh
3. Contactez votre manager

**Feature request** ?
Envoyez un email à l'équipe IXEO avec :
- Description de la feature
- Cas d'usage
- Impact estimé

---

**ProspectFlow v1.0**
Développé par IXEO SAS • Juin 2026
Gratuit • Open for improvements
