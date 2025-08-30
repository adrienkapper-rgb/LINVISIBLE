// Script de test pour la route API Next.js Mondial Relay
// Exécuter avec: npx tsx test-api-route.ts

async function testAPIRoute() {
  console.log('=== Test de la route API Mondial Relay ===\n')
  
  const baseUrl = 'http://localhost:3000'
  
  // Test 1: Recherche avec code postal de Bordeaux
  console.log('Test 1: Recherche à Bordeaux (33000)')
  console.log('----------------------------------------')
  
  try {
    const response = await fetch(`${baseUrl}/api/mondial-relay/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        codePostal: '33000',
        ville: 'BORDEAUX'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`✓ Succès! ${result.points?.length || 0} point(s) relais trouvé(s)`)
      
      if (result.points && result.points.length > 0) {
        console.log('\nPremiers points relais:')
        result.points.slice(0, 3).forEach((point: any, index: number) => {
          console.log(`\n${index + 1}. ${point.LgAdr1}`)
          console.log(`   ID: ${point.Num}`)
          console.log(`   Adresse: ${point.LgAdr3}`)
          console.log(`   ${point.CP} ${point.Ville}`)
        })
      }
    } else {
      console.log(`✗ Erreur: ${result.error}`)
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel:', error)
    console.log('\n⚠️  Assurez-vous que le serveur Next.js est lancé (npm run dev)')
  }
  
  console.log('\n')
  
  // Test 2: Test sans code postal (doit retourner une erreur)
  console.log('Test 2: Test sans code postal (erreur attendue)')
  console.log('----------------------------------------')
  
  try {
    const response = await fetch(`${baseUrl}/api/mondial-relay/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ville: 'BORDEAUX'
      })
    })
    
    const result = await response.json()
    
    if (response.status === 400) {
      console.log(`✓ Erreur attendue: ${result.error}`)
    } else {
      console.log(`✗ Devrait retourner une erreur 400`)
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel:', error)
  }
  
  console.log('\n=== Fin des tests ===')
}

// Lancer les tests
testAPIRoute().catch(console.error)