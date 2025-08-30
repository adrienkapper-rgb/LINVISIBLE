import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testAllTemplates() {
  console.log('🎨 Test de tous les templates avec nouveau design')
  console.log('===================================================')
  
  // Récupérer la commande la plus récente
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    
  if (error || !orders || orders.length === 0) {
    console.error('❌ Erreur récupération commande:', error)
    return
  }
  
  const order = orders[0]
  console.log(`📦 Commande test: ${order.order_number} (${order.email})`)
  
  // Récupérer les items de la commande
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
  
  const tests = [
    { function: 'send-order-confirmation', name: 'Confirmation commande (nouveau design)' },
    { function: 'send-payment-confirmation', name: 'Confirmation paiement (nouveau design)' },
    { function: 'send-admin-notification', name: 'Notification admin (nouveau design)' },
    { function: 'send-shipping-notification', name: 'Notification expédition (nouveau design)' },
    { function: 'send-delivery-notification', name: 'Notification livraison (nouveau design)' }
  ]

  let successCount = 0
  
  for (const test of tests) {
    console.log(`\\n🧪 Test ${test.name}...`)
    
    try {
      const { data, error } = await supabase.functions.invoke(test.function, {
        body: {
          order,
          orderItems: orderItems || []
        }
      })

      if (error) {
        console.error(`❌ Erreur ${test.name}:`, error)
      } else if (data && data.success) {
        console.log(`✅ ${test.name} réussi`)
        successCount++
      } else {
        console.error(`❌ ${test.name} échoué:`, data)
      }
    } catch (error) {
      console.error(`❌ Exception ${test.name}:`, error)
    }
    
    // Attendre entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log(`\\n📊 Résultats: ${successCount}/${tests.length} templates réussis`)
  
  if (successCount === tests.length) {
    console.log('\\n🎉 Tous les nouveaux templates avec design cohérent fonctionnent !')
    console.log('📧 Vérifiez votre boîte email adrienkapper@gmail.com')
    console.log('🎨 Les emails utilisent maintenant:')
    console.log('   • Les polices Inter + Playfair Display du site')
    console.log('   • La palette beige/crème cohérente')
    console.log('   • Le style élégant et artisanal')
    console.log('   • Des cards avec bordures arrondies')
    console.log('   • Une hiérarchie typographique identique au site')
  } else {
    console.log('\\n⚠️ Certains templates ont échoué. Vérifiez les logs.')
  }
}

// Exécuter les tests
testAllTemplates().catch(console.error)