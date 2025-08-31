import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSingleFunction() {
  console.log('🧪 Test d\'une Edge Function avec détails d\'erreur')
  
  const mockOrder = {
    id: 'test-order-id',
    order_number: 'ORD-TEST-123456',
    email: 'adrienkapper@gmail.com',
    first_name: 'Adrien',
    last_name: 'Kapper',
    phone: '0123456789',
    subtotal: 89.97,
    shipping_cost: 4.95,
    total: 94.92,
    created_at: new Date().toISOString(),
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
      body: {
        order: mockOrder,
        orderItems: [
          {
            product_name: 'French Mule',
            product_price: 29.99,
            quantity: 2,
            total: 59.98,
          }
        ]
      }
    })

    if (error) {
      console.error('❌ Erreur complète:', error)
      
      // Essayer de lire la réponse pour plus de détails
      if (error.context && error.context.body) {
        try {
          const errorBody = await error.context.text()
          console.error('📄 Corps de l\'erreur:', errorBody)
        } catch (e) {
          console.error('Impossible de lire le corps de l\'erreur')
        }
      }
      return
    }

    console.log('✅ Succès:', data)
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

testSingleFunction().catch(console.error)