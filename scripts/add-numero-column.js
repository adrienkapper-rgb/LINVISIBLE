const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

// Créer le client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addNumeroColumn() {
  try {
    console.log('🔄 Ajout de la colonne "numero" à la table products...');

    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'add_numero_column_to_products.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Contenu SQL:', sqlQuery);

    // Exécuter la requête SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête:', error);
      return;
    }

    console.log('✅ Colonne "numero" ajoutée avec succès à la table products');
    console.log('📊 Résultat:', data);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

// Exécuter le script
addNumeroColumn();