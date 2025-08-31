import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '[SET]' : '[NOT SET]')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mock order data pour les tests
const mockOrder = {
  id: 'test-order-id',
  order_number: 'ORD-TEST-EDGE-123456',
  customer_id: null,
  email: 'adrienkapper@gmail.com',
  first_name: 'Adrien',
  last_name: 'Kapper',
  phone: '0123456789',
  mondial_relay_point: 'Point Relais Test - 123 Rue de la Paix, 75001 Paris',
  delivery_type: 'point-relais' as const,
  delivery_address: null,
  delivery_postal_code: null,
  delivery_city: null,
  delivery_country: 'France',
  subtotal: 89.97,
  shipping_cost: 4.95,
  total: 94.92,
  status: 'pending' as const,
  stripe_payment_intent_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockOrderItems = [
  {
    id: 'item-1',
    order_id: mockOrder.id,
    product_id: 'prod-1',
    product_name: 'French Mule',
    product_price: 29.99,
    quantity: 2,
    total: 59.98,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    order_id: mockOrder.id,
    product_id: 'prod-2',
    product_name: 'Mojito',
    product_price: 29.99,
    quantity: 1,
    total: 29.99,
    created_at: new Date().toISOString(),
  }
]

async function testEdgeFunction(functionName: string, testName: string) {
  console.log(`\n🧪 Test ${testName}...`)
  
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        order: mockOrder,
        orderItems: mockOrderItems
      }
    })

    if (error) {
      console.error(`❌ Erreur ${testName}:`, error)
      return false
    }

    if (data && data.success) {
      console.log(`✅ ${testName} réussi`)
      return true
    } else {
      console.error(`❌ ${testName} échoué:`, data)
      return false
    }
  } catch (error) {
    console.error(`❌ Exception ${testName}:`, error)
    return false
  }
}

async function testAllEdgeFunctions() {
  console.log('🚀 Test des Edge Functions Supabase')
  console.log('=====================================')
  
  const tests = [
    { function: 'send-order-confirmation', name: 'Email confirmation commande' },
    { function: 'send-payment-confirmation', name: 'Email confirmation paiement' },
    { function: 'send-admin-notification', name: 'Email notification admin' },
    { function: 'send-shipping-notification', name: 'Email notification expédition' },
    { function: 'send-delivery-notification', name: 'Email notification livraison' }
  ]

  let successCount = 0
  
  for (const test of tests) {
    const success = await testEdgeFunction(test.function, test.name)
    if (success) successCount++
    
    // Attendre un peu entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log(`\n📊 Résultats: ${successCount}/${tests.length} tests réussis`)
  
  if (successCount === tests.length) {
    console.log('\n🎉 Tous les tests Edge Functions sont réussis!')
    console.log('Le système d\'emails est opérationnel via les Edge Functions.')
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez les logs.')
  }
}

// Exécuter les tests
testAllEdgeFunctions().catch(console.error)