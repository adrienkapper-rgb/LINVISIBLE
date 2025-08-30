// Script de test pour le calculateur de tarif Mondial Relay
// Exécuter avec: npx tsx test-shipping-calculator.ts

import { calculateTotalWeight, getShippingInfo, validatePackageWeight } from './lib/shipping/mondial-relay-pricing'

// Simulation de produits avec leurs poids
const mockProduct = {
  weight: 750 // 750g par bouteille
}

// Différents scénarios de commandes
const testScenarios = [
  {
    name: "1 bouteille",
    items: [{ product: mockProduct, quantity: 1 }]
  },
  {
    name: "2 bouteilles", 
    items: [{ product: mockProduct, quantity: 2 }]
  },
  {
    name: "3 bouteilles",
    items: [{ product: mockProduct, quantity: 3 }]
  },
  {
    name: "6 bouteilles (pack)",
    items: [{ product: mockProduct, quantity: 6 }]
  },
  {
    name: "12 bouteilles",
    items: [{ product: mockProduct, quantity: 12 }]
  },
  {
    name: "24 bouteilles",
    items: [{ product: mockProduct, quantity: 24 }]
  },
  {
    name: "40 bouteilles (limite 30kg)",
    items: [{ product: mockProduct, quantity: 40 }]
  }
]

function testShippingCalculator() {
  console.log('=== Test du calculateur de tarif Mondial Relay ===\n')
  
  console.log('Poids par bouteille: 750g')
  console.log('Poids emballage ajouté: +100g\n')
  
  testScenarios.forEach(scenario => {
    console.log(`📦 Scénario: ${scenario.name}`)
    console.log('----------------------------------------')
    
    try {
      const totalWeight = calculateTotalWeight(scenario.items)
      const shippingInfo = getShippingInfo(totalWeight)
      const validation = validatePackageWeight(totalWeight)
      
      console.log(`Poids total: ${shippingInfo.formattedWeight}`)
      console.log(`Tarif livraison: ${shippingInfo.cost.toFixed(2)}€`)
      
      if (!validation.isValid) {
        console.log(`❌ Erreur: ${validation.error}`)
      } else {
        console.log(`✅ Commande valide`)
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
    
    console.log('')
  })
  
  // Test de comparaison avec l'ancien tarif fixe
  console.log('📊 Comparaison avec l\'ancien tarif fixe de 5,90€')
  console.log('========================================================')
  
  testScenarios.slice(0, 5).forEach(scenario => {
    const totalWeight = calculateTotalWeight(scenario.items)
    const shippingInfo = getShippingInfo(totalWeight)
    const oldPrice = 5.90
    const newPrice = shippingInfo.cost
    const difference = newPrice - oldPrice
    
    console.log(`${scenario.name}: ${newPrice.toFixed(2)}€ vs ${oldPrice.toFixed(2)}€ (${difference > 0 ? '+' : ''}${difference.toFixed(2)}€)`)
  })
}

// Lancer les tests
testShippingCalculator()