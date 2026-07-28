# Setup Waso

## 1. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) (ou utiliser celui déjà lié au repo).
2. Récupérer `Project URL` et `anon public key` dans Project Settings → API.
3. Récupérer le `project-ref` : c'est l'identifiant du projet, visible dans Project Settings → General (champ "Reference ID"), ou directement dans l'URL Supabase — `https://<project-ref>.supabase.co` (la partie avant `.supabase.co`).
4. Appliquer le schéma :
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
   - `login` ouvre le navigateur pour t'authentifier une fois.
   - `link` te demande le mot de passe de la **base de données** (celui choisi à la création du projet — pas ton mot de passe de compte Supabase ; si tu ne l'as plus, réinitialise-le dans Project Settings → Database).
   - `db push` applique `supabase/migrations/0001_init.sql`, qui crée `profiles`, `sightings`, les policies RLS, et un trigger qui crée automatiquement une ligne `profiles` à chaque nouvel utilisateur.
4. Créer les comptes manuellement dans Authentication → Users → Add user (email + mot de passe). Le trigger crée automatiquement le profil associé (pseudo = partie avant le `@` de l'email, modifiable ensuite depuis l'écran Profil).

## 2. Variables d'environnement

Copier `.env.example` en `.env` et renseigner :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
Ce fichier n'est jamais commité (`.gitignore`).

## 3. Développement local

```bash
npm install
npm run build:birds   # à relancer seulement si BIRDS.csv change
npm run dev
```

## 4. Déploiement GitHub Pages

1. Dans les Settings du repo GitHub → Pages, choisir la source "GitHub Actions".
2. Dans Settings → Secrets and variables → Actions, ajouter les secrets `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. Un push sur `main` déclenche `.github/workflows/deploy.yml` qui build et déploie automatiquement sur `https://<utilisateur>.github.io/Waso/`.

## 5. Modifier le catalogue d'oiseaux

Éditer `BIRDS.csv` puis relancer `npm run build:birds` (régénère `src/data/birds.generated.json`, committé dans le repo) avant de commit/push.
