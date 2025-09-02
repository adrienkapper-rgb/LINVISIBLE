# Configuration des Webhooks Stripe - L'Invisible Shop

## Webhooks configurés :

### 1. Webhook TEST (Vercel)
- **URL** : https://cocktails-linvisible.fr/api/webhooks/stripe
- **Nom** : linvisible-test-webhook
- **Secret** : whsec_3DShWIryl5cj4jAFlmOFhkO2DKIcNr4W
- **Utilisation** : Tests sur Vercel avec clés Stripe de test
- **Événements** : payment_intent.succeeded, payment_intent.payment_failed

### 2. Webhook PRODUCTION (À configurer)
- **URL** : https://cocktails-linvisible.fr/api/webhooks/stripe
- **Nom** : linvisible-production-webhook
- **Secret** : À configurer avec les clés de production
- **Utilisation** : Production avec clés Stripe live
- **Événements** : payment_intent.succeeded, payment_intent.payment_failed

## Configuration sur Vercel :

### Variables d'environnement requises :
```
STRIPE_SECRET_KEY=sk_test_... (ou sk_live_... en production)
STRIPE_WEBHOOK_SECRET=whsec_3DShWIryl5cj4jAFlmOFhkO2DKIcNr4W (test) 
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_... en production)
NEXT_PUBLIC_SUPABASE_URL=https://rnxhkjvcixumuvjfxdjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_...
ADMIN_EMAIL=adrienkapper@gmail.com
```

### Important :
- **Mode TEST** : Utilisez le webhook de test avec `whsec_3DShWIryl5cj4jAFlmOFhkO2DKIcNr4W`
- **Mode PRODUCTION** : Créez un nouveau webhook en mode live avec un nouveau secret

## Test du webhook :
1. Effectuez un paiement de test sur https://cocktails-linvisible.fr
2. Vérifiez que le statut de la commande passe de `pending` à `processing`
3. Consultez les logs Vercel pour voir les événements webhook
4. Vérifiez que les emails de confirmation sont envoyés

## Diagnostic :
- **Endpoint de debug** : https://cocktails-linvisible.fr/api/webhooks/stripe/debug
- **Logs Vercel** : Dashboard Vercel > Functions > Logs
- **Dashboard Stripe** : Webhooks > Événements pour voir les tentatives de livraison
