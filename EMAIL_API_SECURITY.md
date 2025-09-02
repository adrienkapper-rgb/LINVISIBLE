# Sécurité des API Routes Email

## 🔐 Architecture de sécurité

### Configuration des clés
- **INTERNAL_API_KEY**: Clé secrète partagée entre l'Edge Function et les API Routes
- **Valeur**: `lin_secret_api_key_2025_safe_internal_emails`
- **Usage**: Authentification des appels internes

### Points de sécurité

#### 1. API Routes protégées
```typescript
const apiKey = request.headers.get('x-api-key')
if (apiKey !== process.env.INTERNAL_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

#### 2. Headers requis
- `Content-Type: application/json`
- `x-api-key: <INTERNAL_API_KEY>`

#### 3. Validation des données
- Vérification de la présence des données de commande
- Validation du format email
- Contrôle des champs obligatoires

## 🚀 Endpoints disponibles

### POST /api/emails/send-confirmation
Envoie un email de confirmation au client

**Headers requis:**
```
Content-Type: application/json
x-api-key: lin_secret_api_key_2025_safe_internal_emails
```

**Body:**
```json
{
  "order": { /* OrderData */ },
  "orderItems": [ /* OrderItem[] */ ]
}
```

### POST /api/emails/send-admin
Envoie un email de notification à l'admin

**Headers requis:**
```
Content-Type: application/json
x-api-key: lin_secret_api_key_2025_safe_internal_emails
```

**Body:**
```json
{
  "order": { /* OrderData */ },
  "orderItems": [ /* OrderItem[] */ ]
}
```

## 🔄 Flux de sécurité

1. **Stripe Webhook** → **Supabase Edge Function**
   - Vérification signature Stripe
   - Authentification JWT désactivée (sécurité via Stripe)

2. **Edge Function** → **API Routes Next.js**
   - Header `x-api-key` avec clé secrète
   - Validation côté API Route

3. **API Routes** → **Resend**
   - Utilisation de `RESEND_API_KEY`
   - Templates email sécurisés

## ⚠️ Points d'attention

- La clé `INTERNAL_API_KEY` doit être identique dans `.env.local` et `supabase/functions/.env`
- Les API Routes ne sont accessibles qu'avec la clé correcte
- Les logs ne doivent jamais exposer la clé secrète
- Le `NEXTJS_URL` doit pointer vers le bon environnement (prod/dev)

## 🔧 Variables d'environnement

### Next.js (.env.local)
```bash
INTERNAL_API_KEY=lin_secret_api_key_2025_safe_internal_emails
RESEND_API_KEY=re_CM629xWr_CfLWDFbxqdnzC6PuzfFRboN2
ADMIN_EMAIL=adrienkapper@gmail.com
```

### Supabase Edge Functions (.env)
```bash
INTERNAL_API_KEY=lin_secret_api_key_2025_safe_internal_emails
NEXTJS_URL=https://linvisible-shop.vercel.app
```