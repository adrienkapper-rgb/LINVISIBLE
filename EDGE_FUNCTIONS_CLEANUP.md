# 🧹 Nettoyage Edge Functions - Plus nécessaires

Les Edge Functions Supabase pour l'envoi d'emails ont été remplacées par l'intégration directe Resend dans Next.js.

## Avantages de l'intégration directe :
- ✅ Plus rapide (pas de trigger DB)
- ✅ Plus simple (moins de composants)  
- ✅ Meilleur contrôle des erreurs
- ✅ Debugging plus facile
- ✅ Pas de dépendance supplémentaire

## Dossiers/fichiers qui peuvent être supprimés :
- `supabase/functions/send-order-confirmation/` 
- `supabase/functions/_shared/` (si seulement utilisé pour emails)

## Configuration Supabase à nettoyer :
- Triggers de base de données pour l'envoi d'emails (si configurés)
- Variables d'environnement dans Supabase Dashboard (RESEND_API_KEY)

## Note :
L'intégration actuelle dans `lib/email/service.ts` est maintenant la source unique de vérité pour l'envoi d'emails.
