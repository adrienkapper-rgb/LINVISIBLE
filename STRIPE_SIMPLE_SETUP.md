# Configuration Stripe Simple - Architecture Next.js

## 🎯 **Architecture finale**
```
Stripe → Next.js Webhook → Service Email → Resend
```

## 🔧 **Configuration Stripe Dashboard**

### 1. **Créer le webhook**
1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer sur **"Add endpoint"**
3. **URL** : `https://linvisible-shop.vercel.app/api/webhooks/stripe`
4. **Événements à écouter** :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 2. **Récupérer le secret**
1. Cliquer sur le webhook créé
2. Copier la **"Signing secret"** (commence par `whsec_...`)
3. L'ajouter dans les variables Vercel

## ⚙️ **Variables d'environnement Vercel**

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... ou sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... ou pk_test_...

# Email Configuration  
RESEND_API_KEY=re_...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rnxhkjvcixumuvjfxdjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 🔄 **Flux de traitement**

1. **Paiement Stripe** → Webhook déclenché
2. **Next.js reçoit** → Vérifie signature 
3. **Base de données** → Met à jour commande/paiement
4. **Emails automatiques** :
   - ✉️ Confirmation commande (client)
   - 💰 Confirmation paiement (client) 
   - 🔔 Notification admin

## ✅ **Test**

### Mode test
- Utiliser les clés `sk_test_...` et `pk_test_...`
- Webhook URL : `https://linvisible-shop.vercel.app/api/webhooks/stripe`

### Mode production
- Utiliser les clés `sk_live_...` et `pk_live_...`  
- Même URL webhook

## 🚀 **Avantages de cette architecture**

- ✅ **Simple** : Une seule technologie
- ✅ **Fiable** : Moins de points de défaillance  
- ✅ **Rapide** : Traitement direct
- ✅ **Maintenable** : Code centralisé
- ✅ **Scalable** : Serverless Vercel

## 📧 **Templates email inclus**

- **Design L'INVISIBLE** avec fonts Playfair Display + Inter
- **Responsive** et professionnel
- **3 types d'emails** automatiques
- **Domaine vérifié** : `cocktails-linvisible.fr`

---

**Architecture finale** : SIMPLE et EFFICACE ! 🎉