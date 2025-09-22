-- Ajouter la colonne "numero" à la table products
-- Cette colonne sera de type INTEGER, NOT NULL avec une valeur par défaut de 0

ALTER TABLE products
ADD COLUMN numero INTEGER NOT NULL DEFAULT 0;

-- Commentaire pour expliquer la colonne
COMMENT ON COLUMN products.numero IS 'Numéro de référence du produit';