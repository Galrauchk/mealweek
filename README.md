# MealWeek 🍽️

App de planification des repas pour Jeffrey & Laurine.

## Stack
- React + Vite
- Netlify (hosting + Functions)
- localStorage (persistance)
- API Anthropic Claude via Netlify Function sécurisée

## Setup local

```bash
npm install
npm install -g netlify-cli   # si pas déjà installé
```

## Variables d'environnement

Dans Netlify → Site settings → Environment variables, ajouter :

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

Pour le dev local, créer un fichier `.env` à la racine :
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

## Développement local

```bash
netlify dev   # Lance Vite + les Netlify Functions en même temps sur http://localhost:8888
```

## Déploiement Netlify

### Option A — Via GitHub (recommandé)
1. Push le projet sur un repo GitHub (compte Galrauchk)
2. Netlify → "Add new site" → "Import from Git"
3. Ajouter la variable `ANTHROPIC_API_KEY` dans les env vars
4. Deploy automatique à chaque push

### Option B — CLI
```bash
netlify login
netlify init
netlify deploy --prod
```

## Structure

```
mealweek/
├── netlify/
│   └── functions/
│       └── claude.js          # Proxy API Claude (clé cachée serveur)
├── src/
│   ├── components/
│   │   ├── UI.jsx             # Composants réutilisables
│   │   ├── PlanningTab.jsx    # Onglet planning
│   │   ├── CoursesTab.jsx     # Onglet courses
│   │   ├── PrefsTab.jsx       # Onglet préférences
│   │   ├── FreezerPanel.jsx   # Gestion stock congélateur
│   │   └── BatchTracker.jsx   # Suivi portions batch
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   ├── api.js             # Appels Claude + helpers
│   │   └── constants.js       # Config globale
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── netlify.toml
└── package.json
```

## Fonctionnalités

- ✅ Planning semaine (midi + soir), navigation semaine par semaine
- ✅ Génération IA complète ou repas par repas
- ✅ Logique surgelé/conserve/frais avec règle décongélation
- ✅ Stock congélateur persistant (pioche dedans à chaque génération)
- ✅ Batch cooking Dimanche APM + Mercredi APM avec suivi de portions
- ✅ Liste de courses organisée par jour d'achat + estimation budget
- ✅ Budget tracker (objectif 50-80€/semaine)
- ✅ Préférences persistantes par personne
- ✅ 100% mobile-first, dark theme
- ✅ Toutes les données sauvegardées en localStorage
