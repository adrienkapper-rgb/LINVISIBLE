const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

async function addNumeroColumnViaAPI() {
  try {
    console.log('🔄 Ajout de la colonne "numero" à la table products via API REST...');

    // URL et clés Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Vous devrez ajouter cette clé

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL non trouvée dans .env.local');
    }

    if (!supabaseServiceKey) {
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY non trouvée dans .env.local');
      console.log('📝 Vous devez ajouter votre clé de service role pour exécuter des requêtes DDL');
      console.log('💡 Alternative: Exécutez directement dans l\'interface web Supabase');
      return;
    }

    // Requête SQL
    const sqlQuery = `
      ALTER TABLE products
      ADD COLUMN numero INTEGER NOT NULL DEFAULT 0;

      COMMENT ON COLUMN products.numero IS 'Numéro de référence du produit';
    `;

    console.log('📄 Requête SQL à exécuter:', sqlQuery);

    // Utiliser l'API REST pour exécuter la requête
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        query: sqlQuery
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Colonne "numero" ajoutée avec succès à la table products');
    console.log('📊 Résultat:', result);

    // Vérification
    console.log('🔍 Vérification de la nouvelle colonne...');

    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = 'products'
          AND column_name = 'numero';
        `
      })
    });

    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log('✅ Vérification réussie:', verifyResult);
    }

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    console.log('\n💡 Solutions alternatives:');
    console.log('1. Exécutez la requête directement dans l\'interface web Supabase');
    console.log('2. Ajoutez SUPABASE_SERVICE_ROLE_KEY à votre fichier .env.local');
    console.log('3. Utilisez le CLI Supabase si disponible');
  }
}

// Message d'information
console.log('🎯 Script pour ajouter la colonne "numero" à la table products');
console.log('📋 Projet Supabase: rnxhkjvcixumuvjfxdjo');
console.log('🔗 URL: https://rnxhkjvcixumuvjfxdjo.supabase.co\n');

// Exécuter le script
addNumeroColumnViaAPI();