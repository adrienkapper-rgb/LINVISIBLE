# Guide pour ajouter la colonne "numero" à la table products

## Requête SQL à exécuter

```sql
-- Ajouter la colonne "numero" à la table products
-- Cette colonne sera de type INTEGER, NOT NULL avec une valeur par défaut de 0

ALTER TABLE products
ADD COLUMN numero INTEGER NOT NULL DEFAULT 0;

-- Commentaire pour expliquer la colonne
COMMENT ON COLUMN products.numero IS 'Numéro de référence du produit';
```

## Options d'exécution

### Option 1: Interface Web Supabase (Recommandée)
1. Connectez-vous à https://app.supabase.com
2. Sélectionnez votre projet: `rnxhkjvcixumuvjfxdjo`
3. Allez dans "SQL Editor"
4. Copiez-collez la requête SQL ci-dessus
5. Cliquez sur "Run"

### Option 2: Via l'API REST Supabase
Utiliser le script Node.js fourni dans `/scripts/add-numero-column-api.js`

### Option 3: Via le CLI Supabase (si installé)
```bash
# Installer le CLI Supabase (voir: https://github.com/supabase/cli#install-the-cli)
# Puis exécuter:
supabase db sql --file ./sql/add_numero_column_to_products.sql
```

## Vérification après exécution

Pour vérifier que la colonne a été ajoutée, exécutez cette requête :

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name = 'numero';
```

## Mise à jour des types TypeScript

Après l'exécution réussie, vous devrez mettre à jour le fichier `types/supabase.ts` pour inclure la nouvelle colonne `numero` dans l'interface de la table `products`.

Ajoutez `numero: number` dans les sections Row, Insert et Update de la table products.