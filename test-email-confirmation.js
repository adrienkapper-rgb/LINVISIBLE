// Test de la fonction send-order-confirmation
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rnxhkjvcixumuvjfxdjo.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Variable d\'environnement SUPABASE_ANON_KEY manquante')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testOrderConfirmation() {
  console.log('🧪 Test de la fonction send-order-confirmation...')
  
  const testOrder = {
    order: {
      id: 'test-123',
      order_number: 'TEST-001',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+33123456789',
      delivery_type: 'domicile',
      delivery_address: '123 Rue de Test',
      delivery_postal_code: '75001',
      delivery_city: 'Paris',
      delivery_country: 'France',
      subtotal: 45.00,
      shipping_cost: 5.90,
      total: 50.90,
      status: 'confirmed',
      created_at: new Date().toISOString()
    },
    orderItems: [
      {
        product_name: 'Cocktail L\'Invisible Premium',
        product_price: 15.00,
        quantity: 3,
        total: 45.00
      }
    ]
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
      body: testOrder
    })
    
    if (error) {
      console.error('❌ Erreur lors de l\'appel:', error)
      return
    }
    
    console.log('✅ Réponse de la fonction:', JSON.stringify(data, null, 2))
    console.log('🎉 Test terminé avec succès!')
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message)
  }
}

testOrderConfirmation()