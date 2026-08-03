# MealWeek 🍽️

Application personnelle de planification des repas pour deux personnes.

## Stack
- React + Vite
- Netlify (hosting + Functions)
- localStorage (persistance)
- API Gemini via une Netlify Function sécurisée

## Setup local

```bash
npm install
npm install -g netlify-cli   # si pas déjà installé
```

## Variables d'environnement

Dans Netlify, ajouter :

```
GEMINI_API_KEY=valeur-secrete
```

La Function accepte uniquement les requêtes navigateur de même origine. Cette vérification n'est
pas une authentification. Si l'application doit rester inaccessible au public, la protection du
site Netlify doit couvrir le site et ses Functions avant la mise en production.

Pour le dev local, créer un fichier `.env` à la racine :
```
GEMINI_API_KEY=valeur-secrete
```

## Développement local

```bash
netlify dev   # Lance Vite + les Netlify Functions en même temps sur http://localhost:8888
```

## Déploiement Netlify

### Option A - Via GitHub (recommandé)
1. Push le projet sur un dépôt GitHub privé
2. Importer le dépôt dans Netlify
3. Ajouter `GEMINI_API_KEY` dans les variables serveur
4. Deploy automatique à chaque push

### Option B - CLI
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
│       └── ai.mjs             # Proxy Gemini, clé et prompt côté serveur
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
│   │   ├── api.js             # Appels au proxy IA et helpers
│   │   └── constants.js       # Config globale
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.mjs
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
