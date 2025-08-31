# Configuration des Secrets Supabase

## Méthode 1: Interface Web Supabase (Recommandée)

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet "L'invisble" 
3. Allez dans **Settings** → **Edge Functions**
4. Dans la section **Environment Variables**, cliquez sur **"Add Environment Variable"**
5. Ajoutez ces deux variables :

   **Variable 1:**
   - Name: `RESEND_API_KEY`
   - Value: `re_CM629xWr_CfLWDFbxqdnzC6PuzfFRboN2`

   **Variable 2:**
   - Name: `ADMIN_EMAIL` 
   - Value: `adrienkapper@gmail.com`

6. Cliquez sur **Save** pour chaque variable

## Méthode 2: CLI Supabase (Alternative)

Si vous préférez utiliser la ligne de commande :

1. Connectez-vous à Supabase :
   ```bash
   npx supabase login
   ```

2. Configurez les secrets :
   ```bash
   npx supabase secrets set --project-ref rnxhkjvcixumuvjfxdjo RESEND_API_KEY=re_CM629xWr_CfLWDFbxqdnzC6PuzfFRboN2 ADMIN_EMAIL=adrienkapper@gmail.com
   ```

## Test du système

Une fois les secrets configurés, testez le système :

```bash
npx tsx scripts/test-edge-functions.ts
```

## Vérification

Les Edge Functions suivantes devraient fonctionner :
- ✅ send-order-confirmation
- ✅ send-payment-confirmation  
- ✅ send-admin-notification
- ✅ send-shipping-notification
- ✅ send-delivery-notification

Vous recevrez des emails de test sur `adrienkapper@gmail.com` si tout fonctionne correctement.

## URLs des Edge Functions

Vos Edge Functions sont accessibles aux URLs suivantes :
- https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/send-order-confirmation
- https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/send-payment-confirmation
- https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/send-admin-notification
- https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/send-shipping-notification
- https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/send-delivery-notification