// Test complet du flux paiement -> webhook -> création commande
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnxhkjvcixumuvjfxdjo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGhranZjaXh1bXV2amZ4ZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODI2NjAsImV4cCI6MjA3MTM1ODY2MH0.J_J78PV9oY4slnH6XPAE_0Bf-SJf2ggftQeXJhMAIqg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleteFlow() {
  const testPaymentIntentId = 'pi_test_manual_' + Date.now()
  
  try {
    console.log('🔄 Étape 1: Création d\'une pending_order de test...')
    
    // Créer une pending_order de test
    const { data: pendingOrder, error: pendingError } = await supabase
      .from('pending_orders')
      .insert({
        payment_intent_id: testPaymentIntentId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone: '+33123456789',
        delivery_type: 'domicile',
        delivery_address: '123 Rue de Test',
        delivery_postal_code: '75001',
        delivery_city: 'Paris',
        delivery_country: 'FR',
        items: JSON.stringify([{
          productId: 'test-product',
          productName: 'Produit Test',
          productPrice: 25,
          quantity: 2
        }]),
        subtotal: 50,
        shipping_cost: 0,
        total: 50
      })
      .select()
      .single()
    
    if (pendingError) {
      console.error('❌ Erreur création pending_order:', pendingError)
      return
    }
    
    console.log('✅ Pending order créée:', pendingOrder.id)
    
    console.log('🔄 Étape 2: Test du webhook...')
    
    const testEvent = {
      id: 'evt_test_' + Date.now(),
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: testPaymentIntentId,
          amount: 5000,
          currency: 'eur',
          status: 'succeeded'
        }
      }
    }
    
    const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(testEvent)
    })
    
    const result = await response.text()
    console.log('📊 Webhook Status:', response.status)
    console.log('📄 Webhook Response:', result)
    
    if (response.ok) {
      console.log('✅ Webhook traité avec succès')
      
      // Vérifier si la commande a été créée
      console.log('🔄 Étape 3: Vérification création commande...')
      
      await new Promise(resolve => setTimeout(resolve, 2000)) // Attendre 2s
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('email', 'test@example.com')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (orders && orders.length > 0) {
        console.log('✅ Commande créée:', orders[0].order_number)
        console.log('📊 Statut commande:', orders[0].status)
      } else {
        console.log('❌ Aucune commande trouvée')
        console.error('Erreur recherche commandes:', ordersError)
      }
      
    } else {
      console.log('❌ Échec webhook')
    }
    
  } catch (error) {
    console.error('❌ Erreur test complet:', error)
  }
}

testCompleteFlow()
