# Configuration des Webhooks Stripe - L'Invisible Shop

## Deux webhooks configurés :

### 1. Webhook PRODUCTION (Vercel)
- **URL** : https://www.cocktails-linvisible.fr/api/webhooks/stripe
- **Nom** : creative-brilliance  
- **Secret** : whsec_Z7XHqvtCMW3Tnq4Tqy11nvfABRlfx6cJ
- **Utilisation** : Site en production sur Vercel

### 2. Webhook DÉVELOPPEMENT LOCAL
- **URL** : https://0c20f1245a6.ngrok-free.app/api/webhooks/stripe
- **Nom** : linvisible-shop-local-dev
- **Secret** : whsec_BWfZgzHX3GqrbXrVJ5qxhpSf7YoZfFDo
- **Utilisation** : Développement local avec ngrok

## Comment utiliser :

### Pour le développement local :
1. Lancez votre app : `npm run dev`
2. Lancez ngrok : `ngrok http 3000` 
3. Copiez le fichier : `cp .env.local.dev .env.local`
4. Ou renommez : `.env.local.dev` → `.env.local`

### Pour la production :
- Le fichier `.env.local` doit contenir le secret du webhook Vercel
- Ou configurez les variables d'environnement directement sur Vercel

## URLs ngrok actuelles :
- **HTTPS** : https://0c20f1245a6.ngrok-free.app
- **HTTP** : http://0c20f1245a6.ngrok-free.app

**Note** : L'URL ngrok change à chaque redémarrage. Si vous relancez ngrok, vous devrez mettre à jour l'URL du webhook dans Stripe Dashboard.

## Test des webhooks :
1. Vérifiez que ngrok fonctionne : visitez https://0c20f1245a6.ngrok-free.app
2. Testez les paiements sur votre app locale
3. Vérifiez les logs des webhooks dans Stripe Dashboard
