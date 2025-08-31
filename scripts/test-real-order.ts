import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testWithRealOrder() {
  console.log('🧪 Test avec une vraie commande récente')
  
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
  console.log(`📦 Test avec commande: ${order.order_number} (${order.email})`)
  
  // Récupérer les items de la commande
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
  
  try {
    // Test de l'email de confirmation de commande
    console.log('🧪 Test confirmation de commande...')
    const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
      body: {
        order,
        orderItems: orderItems || []
      }
    })
    
    if (error) {
      console.error('❌ Erreur:', error)
      return
    }
    
    console.log('✅ Email de confirmation envoyé:', data)
    
    // Attendre un peu puis tester l'email de paiement
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('🧪 Test confirmation de paiement...')
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke('send-payment-confirmation', {
      body: {
        order,
        orderItems: orderItems || []
      }
    })
    
    if (paymentError) {
      console.error('❌ Erreur paiement:', paymentError)
    } else {
      console.log('✅ Email de paiement envoyé:', paymentData)
    }
    
    console.log('\n🎉 Test terminé ! Vérifiez votre boîte email adrienkapper@gmail.com')
    
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

testWithRealOrder().catch(console.error)