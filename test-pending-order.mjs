// Test avec création de pending_order AVANT le trigger Stripe CLI
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnxhkjvcixumuvjfxdjo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGhranZjaXh1bXV2amZ4ZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODI2NjAsImV4cCI6MjA3MTM1ODY2MH0.J_J78PV9oY4slnH6XPAE_0Bf-SJf2ggftQeXJhMAIqg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestPendingOrder() {
  const testPaymentIntentId = 'pi_3S30LbAqQATa19fW11kBHKEp' // ID du dernier trigger
  
  console.log('🔄 Création pending_order pour PaymentIntent:', testPaymentIntentId)
  
  const { data, error } = await supabase
    .from('pending_orders')
    .insert({
      payment_intent_id: testPaymentIntentId,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'CLI',
      phone: '+33123456789',
      delivery_type: 'domicile',
      delivery_address: '123 Rue du Test',
      delivery_postal_code: '75001',
      delivery_city: 'Paris',
      delivery_country: 'FR',
      items: JSON.stringify([{
        productId: 'test-product',
        productName: 'Cocktail Test',
        productPrice: 25,
        quantity: 2
      }]),
      subtotal: 50,
      shipping_cost: 0,
      total: 50
    })
    .select()
  
  if (error) {
    console.error('❌ Erreur:', error)
  } else {
    console.log('✅ Pending order créée:', data[0].id)
    console.log('🎯 Maintenant lancez: stripe trigger payment_intent.succeeded --add="payment_intent:id=' + testPaymentIntentId + '"')
  }
}

createTestPendingOrder()
