// Script de test pour l'API Mondial Relay
// Exécuter avec: npx tsx test-mondial-relay.ts

import { MondialRelayClient } from './lib/mondial-relay/client'

// Charger les variables d'environnement
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testMondialRelayAPI() {
  console.log('=== Test de l\'API Mondial Relay ===\n')
  
  // Vérifier les variables d'environnement
  console.log('Configuration:')
  console.log('- Code Enseigne:', process.env.MONDIAL_RELAY_CODE_ENSEIGNE ? '✓ Défini' : '✗ Manquant')
  console.log('- Clé privée:', process.env.MONDIAL_RELAY_PRIVATE_KEY ? '✓ Définie' : '✗ Manquante')
  console.log('- Pays:', process.env.MONDIAL_RELAY_PAYS || 'FR (par défaut)')
  console.log('- Mode:', process.env.MONDIAL_RELAY_MODE || 'TEST (par défaut)')
  console.log('\n')

  try {
    // Créer une instance du client
    const client = new MondialRelayClient()
    
    // Test 1: Recherche avec un code postal de Bordeaux
    console.log('Test 1: Recherche de points relais à Bordeaux (33000)')
    console.log('----------------------------------------')
    
    const result1 = await client.searchPointsRelais({
      codePostal: '33000',
      ville: 'BORDEAUX',
      nbResultats: 5
    })
    
    if (result1.success) {
      console.log(`✓ Succès! ${result1.data?.length || 0} point(s) relais trouvé(s)`)
      
      if (result1.data && result1.data.length > 0) {
        console.log('\nPremiers points relais:')
        result1.data.slice(0, 3).forEach((point, index) => {
          console.log(`\n${index + 1}. ${point.LgAdr1}`)
          console.log(`   ID: ${point.Num}`)
          console.log(`   Adresse: ${point.LgAdr3}`)
          console.log(`   ${point.CP} ${point.Ville}`)
          if (point.Distance) {
            console.log(`   Distance: ${point.Distance}m`)
          }
        })
      }
    } else {
      console.log(`✗ Erreur: ${result1.error}`)
    }
    
    console.log('\n')
    
    // Test 2: Recherche avec un code postal de Paris
    console.log('Test 2: Recherche de points relais à Paris (75001)')
    console.log('----------------------------------------')
    
    const result2 = await client.searchPointsRelais({
      codePostal: '75001',
      ville: 'PARIS',
      nbResultats: 3,
      rayonRecherche: 10
    })
    
    if (result2.success) {
      console.log(`✓ Succès! ${result2.data?.length || 0} point(s) relais trouvé(s)`)
      
      if (result2.data && result2.data.length > 0) {
        console.log('\nPremiers points relais:')
        result2.data.forEach((point, index) => {
          console.log(`\n${index + 1}. ${point.LgAdr1}`)
          console.log(`   ${point.LgAdr3}, ${point.CP} ${point.Ville}`)
        })
      }
    } else {
      console.log(`✗ Erreur: ${result2.error}`)
    }
    
    console.log('\n')
    
    // Test 3: Test avec un code postal invalide
    console.log('Test 3: Test avec un code postal invalide')
    console.log('----------------------------------------')
    
    const result3 = await client.searchPointsRelais({
      codePostal: '00000',
      nbResultats: 5
    })
    
    if (result3.success) {
      console.log(`Résultat: ${result3.data?.length || 0} point(s) relais trouvé(s)`)
    } else {
      console.log(`✓ Erreur attendue: ${result3.error}`)
    }
    
    console.log('\n=== Fin des tests ===')
    
  } catch (error) {
    console.error('Erreur lors du test:', error)
    process.exit(1)
  }
}

// Lancer les tests
testMondialRelayAPI().catch(console.error)