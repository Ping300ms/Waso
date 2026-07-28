# Waso

PWA "Pokedex pour oiseaux" — React + Vite + Supabase, utilisable hors-ligne.

- Voir [SETUP.md](./SETUP.md) pour la configuration Supabase, les variables d'environnement et le déploiement.
- `BIRDS.csv` est la source de vérité du catalogue d'oiseaux ; après modification, lancer `npm run build:birds` pour régénérer `src/data/birds.generated.json`.

## Commandes

```bash
npm install
npm run dev          # serveur de développement
npm run build:birds  # régénère birds.generated.json depuis BIRDS.csv
npm run build         # build de production (dist/)
npm run lint
```
