# Configuration du déploiement Vercel

Pour déployer votre application sur Vercel, suivez ces étapes :

## 1. Connexion à Vercel
1. Allez sur https://vercel.com
2. Connectez-vous avec votre compte GitHub

## 2. Import du projet
1. Cliquez sur 'Add New Project'
2. Importez le repository 'adrienkapper-rgb/LINVISIBLE'
3. Sélectionnez le dossier 'linvisible-shop' comme Root Directory

## 3. Configuration des variables d'environnement
Ajoutez ces variables dans les paramètres du projet Vercel :
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- MONDIAL_RELAY_CODE_ENSEIGNE
- MONDIAL_RELAY_PRIVATE_KEY
- MONDIAL_RELAY_PAYS
- MONDIAL_RELAY_MODE
- RESEND_API_KEY
- ADMIN_EMAIL

## 4. Build Settings
- Framework Preset: Next.js
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install

