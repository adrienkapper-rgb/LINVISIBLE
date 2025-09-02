# Architecture Emails basée sur les Statuts de Commande

## 🎯 **Principe fondamental**
Les emails sont **déclenchés automatiquement par les changements de statut** des commandes, **indépendamment de Stripe**.

## 🔄 **Flux complet**

```
1. Paiement → Webhook Stripe → updateOrderStatus('processing')
2. updateOrderStatus → Détecte changement → Envoie emails automatiquement
3. Plus tard: updateOrderStatus('shipped') → Email d'expédition
4. Enfin: updateOrderStatus('delivered') → Email de livraison
```

## 📧 **Emails par statut**

### `processing` (Commande payée)
```javascript
await sendOrderConfirmationEmail({ order, orderItems })     // Client
await sendPaymentConfirmationEmail({ order, orderItems })   // Client  
await sendAdminNotificationEmail({ order, orderItems })     // Admin
```

### `shipped` (Commande expédiée)
```javascript
await sendShippingNotificationEmail({ order, orderItems })  // Client
```

### `delivered` (Commande livrée)
```javascript
await sendDeliveryNotificationEmail({ order, orderItems })  // Client
```

## 💡 **Avantages de cette architecture**

### ✅ **Indépendant du système de paiement**
- Fonctionne avec Stripe, PayPal, virement, etc.
- Pas de couplage fort avec un prestataire

### ✅ **Testable facilement**
```javascript
// Pour tester les emails, il suffit de :
updateOrderStatus('order-id-123', 'processing')
// → Emails envoyés automatiquement !
```

### ✅ **Robuste et résilient**
- Si le webhook échoue, on peut rejouer le changement de statut
- Les emails ne sont jamais perdus
- Un seul point de vérité : le statut de la commande

### ✅ **Logique métier claire**
- `processing` = Commande payée → Emails de confirmation
- `shipped` = Commande expédiée → Email de suivi
- `delivered` = Commande livrée → Email final

## 🔧 **Implémentation**

### Dans `/lib/api/orders.ts`
```javascript
// Send status change emails
if (previousStatus !== status) {
  if (status === 'processing') {
    // Tous les emails de confirmation
    await sendOrderConfirmationEmail({ order: updatedOrder, orderItems })
    await sendPaymentConfirmationEmail({ order: updatedOrder, orderItems })
    await sendAdminNotificationEmail({ order: updatedOrder, orderItems })
  }
  // Autres statuts...
}
```

### Dans `/app/api/webhooks/stripe/route.ts`
```javascript
// Webhook Stripe se contente de :
await updateOrderStatus(order.id, 'processing', paymentIntent.id)
// → Les emails sont envoyés automatiquement par updateOrderStatus !
```

## 🧪 **Testing**

### Test manuel
```javascript
import { updateOrderStatus } from '@/lib/api/orders'

// Changer le statut d'une commande existante
await updateOrderStatus('real-order-id', 'processing')
// → Vérifier les emails dans les boîtes
```

### Test automatisé
```javascript
// Dans un test Jest/Vitest
it('should send emails when status changes to processing', async () => {
  const result = await updateOrderStatus(orderId, 'processing')
  expect(result.success).toBe(true)
  // Vérifier que les mocks d'emails ont été appelés
})
```

## 🎉 **Résultat**

Architecture **simple, robuste et découplée** :
- ✅ Emails basés sur la logique métier (statuts)
- ✅ Indépendant des systèmes de paiement  
- ✅ Testable et maintenable
- ✅ Pas de duplication de code
- ✅ Une seule source de vérité

**Plus jamais d'emails perdus !** 🚀