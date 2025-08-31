-- Migration pour créer le trigger d'envoi d'emails automatique sur création de commande

-- 1. Créer la fonction qui appelle l'Edge Function Supabase
CREATE OR REPLACE FUNCTION send_order_emails_trigger()
RETURNS TRIGGER AS $$
DECLARE
  request_id uuid;
BEGIN
  -- Appel à l'Edge Function Supabase pour envoyer les emails
  -- Utilisation de supabase_functions.http_request pour appeler l'Edge Function
  SELECT extensions.http_request(
    'POST',
    'https://your-project-id.supabase.co/functions/v1/send-order-emails-trigger',
    '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key', true) || '"}'::jsonb,
    json_build_object(
      'record', row_to_json(NEW)
    )::jsonb
  ) INTO request_id;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Créer le trigger qui se déclenche à chaque INSERT dans orders
DROP TRIGGER IF EXISTS order_created_email_trigger ON orders;
CREATE TRIGGER order_created_email_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_emails_trigger();

-- Commentaire pour expliquer le trigger
COMMENT ON TRIGGER order_created_email_trigger ON orders IS 
'Trigger qui envoie automatiquement les emails de confirmation de commande et notification admin à chaque création de commande via Edge Function Supabase';

-- Note : Il faudra remplacer 'your-project-id' par l'ID réel du projet Supabase
-- et configurer la variable app.supabase_service_role_key