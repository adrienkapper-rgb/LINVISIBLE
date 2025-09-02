# 🚀 Guide de développement avec webhooks Stripe

Ce guide explique comment développer en local avec un système de webhooks fonctionnel.

## 🎯 Problème résolu

En développement local (`localhost:3000`), Stripe ne peut pas envoyer automatiquement les webhooks car votre serveur n'est pas accessible depuis Internet. Cette solution permet de **simuler les webhooks Stripe localement**.

## 🛠️ Solutions disponibles

### Option 1 : Webhook Listener automatique (Recommandée)

Lance automatiquement Next.js + webhook listener :

```bash
npm run dev:full
```

**Avantages :**
- ✅ Configuration automatique
- ✅ Logs unifiés 
- ✅ Un seul terminal

### Option 2 : Processus séparés

**Terminal 1** - Serveur Next.js :
```bash
npm run dev
```

**Terminal 2** - Webhook listener :
```bash
npm run dev:webhooks
```

**Avantages :**
- ✅ Contrôle séparé des processus
- ✅ Logs isolés

## 📋 Instructions d'utilisation

### 1. Démarrer l'environnement

```bash
cd linvisible-shop
npm run dev:full
```

### 2. Tester une commande

1. **Créer une commande** via l'interface ou l'API
2. **Noter le PaymentIntent ID** (ex: `pi_1234567890`)
3. **Dans le webhook listener**, saisir :
   ```
   success pi_1234567890
   ```

### 3. Commandes disponibles

- `success <payment_intent_id>` - Simuler un paiement réussi
- `failed <payment_intent_id>` - Simuler un paiement échoué
- `help` - Afficher l'aide
- `quit` - Quitter le listener

## 🔧 Configuration technique

### Webhook Secret

Le fichier `.env.local` utilise le **même secret que la production Vercel** :
```bash
STRIPE_WEBHOOK_SECRET=whsec_Z7XHqvtCMW3Tnq4Tqy11nvfABRlfx6cJ
```

### Signature Stripe

Le script utilise le **vrai secret Stripe de production** pour générer des signatures identiques à celles de Vercel. Cela garantit que vos tests locaux sont parfaitement représentatifs de la production.

## 🧪 Exemple de test complet

```bash
# 1. Démarrer l'environnement
npm run dev:full

# 2. Créer une commande (navigateur ou API)
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com",...}'

# Réponse : {"paymentIntentId": "pi_abc123", ...}

# 3. Simuler le paiement réussi (dans le webhook listener)
success pi_abc123

# 4. Vérifier les logs
[NEXT] ✅ Paiement traité avec succès pour commande ORD-xxx
[WEBHOOK] ✅ Webhook envoyé avec succès!
```

## 🚀 Avantages de cette solution

- **🎯 Identique à Stripe CLI** : Signatures et comportement identiques
- **⚡ Instantané** : Pas d'attente de synchronisation
- **🔍 Logs détaillés** : Voir exactement ce qui se passe
- **🧪 Tests répétables** : Relancer les mêmes scénarios
- **📱 Simple** : Interface en ligne de commande intuitive

## 🆚 Comparaison avec Stripe CLI

| Fonctionnalité | Notre solution | Stripe CLI |
|----------------|----------------|------------|
| Webhooks locaux | ✅ | ✅ |
| Signatures valides | ✅ | ✅ |
| Installation simple | ✅ | ⚠️ (binaire) |
| Logs détaillés | ✅ | ✅ |
| Tests manuels | ✅ | ❌ |
| Integration CI/CD | ✅ | ⚠️ |

## 🔄 Workflow de développement

1. **Développement** : `npm run dev:full`
2. **Créer commande** : Via interface ou API
3. **Tester paiement** : `success <payment_intent_id>`
4. **Vérifier emails** : Consultez les logs
5. **Déboguer** : Logs détaillés disponibles

---

💡 **Pro tip** : Gardez un fichier avec quelques PaymentIntent IDs de test pour relancer rapidement des scénarios pendant le développement.