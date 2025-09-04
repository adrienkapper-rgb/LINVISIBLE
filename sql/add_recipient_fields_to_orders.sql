-- Migration pour ajouter les champs destinataire à la table orders
-- Permet de stocker les informations du destinataire pour les commandes cadeaux

-- Ajouter les nouveaux champs à la table orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_gift BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recipient_first_name TEXT,
ADD COLUMN IF NOT EXISTS recipient_last_name TEXT;

-- Commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN orders.is_gift IS 'Indique si la commande est un cadeau (true) ou pour l''acheteur lui-même (false)';
COMMENT ON COLUMN orders.recipient_first_name IS 'Prénom du destinataire du cadeau (null si is_gift = false)';
COMMENT ON COLUMN orders.recipient_last_name IS 'Nom du destinataire du cadeau (null si is_gift = false)';

-- Index pour faciliter les requêtes sur les commandes cadeaux
CREATE INDEX IF NOT EXISTS idx_orders_is_gift ON orders(is_gift);

-- Vérifier que les champs ont été ajoutés
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('is_gift', 'recipient_first_name', 'recipient_last_name')
ORDER BY column_name;