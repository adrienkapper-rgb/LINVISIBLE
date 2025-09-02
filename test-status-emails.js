// Test de la logique d'emails indépendante de Stripe
import { updateOrderStatus } from './lib/api/orders.js'

async function testStatusEmailTrigger() {
  console.log('🧪 Test des emails déclenchés par changement de statut')
  console.log('========================================================')
  
  // ID de commande test (remplacer par un vrai ID de votre base de données)
  const TEST_ORDER_ID = 'test-order-id-here'
  
  try {
    console.log(`📝 Test: Changement de statut vers 'processing' pour commande ${TEST_ORDER_ID}`)
    
    const result = await updateOrderStatus(TEST_ORDER_ID, 'processing')
    
    if (result.success) {
      console.log('✅ Changement de statut réussi')
      console.log('📧 Les emails ont dû être envoyés automatiquement')
      console.log('')
      console.log('Vérifiez vos boîtes emails :')
      console.log('- 📬 Email client: confirmation commande + paiement')
      console.log('- 🔔 Email admin: notification nouvelle commande')
    } else {
      console.error('❌ Erreur changement de statut:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error)
  }
}

console.log('⚠️  Pour tester, remplacez TEST_ORDER_ID par un vrai ID de commande')
console.log('⚠️  Puis exécutez: node test-status-emails.js')
console.log('')
console.log('🎯 Avantages de cette approche:')
console.log('  ✅ Indépendant de Stripe')
console.log('  ✅ Testable manuellement') 
console.log('  ✅ Robuste (peut rejouer)')
console.log('  ✅ Simple et prévisible')

// testStatusEmailTrigger()