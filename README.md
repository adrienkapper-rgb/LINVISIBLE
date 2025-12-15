# L'Invisible - Storefront

Site e-commerce public pour L'Invisible, atelier artisanal de cocktails prêts à boire.

## Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Paiements**: Stripe
- **Livraison**: Mondial Relay
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI

## Installation locale

### 1. Cloner le repository

```bash
git clone https://github.com/USERNAME/linvisible-storefront.git
cd linvisible-storefront
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Copier le fichier `.env.example` vers `.env.local` et renseigner les valeurs :

```bash
cp .env.example .env.local
```

Variables requises :
- `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe
- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret du webhook Stripe
- `MONDIAL_RELAY_*` - Configuration Mondial Relay
- `RESEND_API_KEY` - Clé API Resend pour les emails

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## Scripts disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Build de production
- `npm run start` - Lancer le serveur de production
- `npm run lint` - Vérification du code

## Structure du projet

```
linvisible-storefront/
├── app/                    # Routes Next.js (App Router)
│   ├── page.tsx            # Page d'accueil
│   ├── produit/[slug]/     # Pages produits
│   ├── panier/             # Panier
│   ├── checkout/           # Processus de commande
│   ├── mes-commandes/      # Historique commandes client
│   ├── api/                # API Routes
│   └── ...
├── components/             # Composants React
│   ├── ui/                 # Composants UI (Radix)
│   ├── layout/             # Header, Footer
│   └── ...
├── lib/                    # Utilitaires et configuration
│   ├── supabase/           # Client Supabase
│   ├── api/                # Fonctions de fetch
│   └── ...
├── hooks/                  # Hooks React personnalisés
├── types/                  # Types TypeScript
└── public/                 # Assets statiques
```

## Déploiement sur Vercel

### 1. Créer un nouveau projet Vercel

```bash
vercel
```

### 2. Configurer les variables d'environnement

Dans le dashboard Vercel, ajouter toutes les variables d'environnement de `.env.example`.

### 3. Configurer le domaine

Ajouter le domaine `linvisible.fr` (ou votre domaine) dans les paramètres du projet.

### 4. Déployer

```bash
vercel --prod
```

## Webhook Stripe

Le webhook Stripe doit pointer vers :
- **URL**: `https://votre-domaine.fr/api/webhooks/stripe` (ou utiliser Supabase Edge Functions)
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Support

Pour toute question, contacter l'équipe de développement.
