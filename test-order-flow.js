const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rnxhkjvcixumuvjfxdjo.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGhranZjaXh1bXV2amZ4ZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODI2NjAsImV4cCI6MjA3MTM1ODY2MH0.J_J78PV9oY4slnH6XPAE_0Bf-SJf2ggftQeXJhMAIqg'
const API_BASE_URL = 'http://localhost:3003'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testOrderFlow() {
  console.log('🚀 Test du flux complet de commande')
  console.log('=====================================')

  try {
    // 1. Vérifier le statut initial
    console.log('\n1️⃣ Vérification du statut initial...')
    const syncStatusResponse = await fetch(`${API_BASE_URL}/api/sync-payments`)
    const syncStatus = await syncStatusResponse.json()
    console.log('📊 Statut actuel:', syncStatus)

    // 2. Créer une commande de test
    console.log('\n2️⃣ Création d\'une commande de test...')
    
    const testOrder = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '+33123456789',
      deliveryType: 'domicile',
      deliveryAddress: '123 Rue de Test',
      deliveryPostalCode: '75001',
      deliveryCity: 'Paris',
      deliveryCountry: 'FR',
      items: [
        {
          productId: 'c913faac-d40f-4d54-aa06-3f76b800a448', // ID d'un produit existant
          productName: 'Cosmopolitan (Test)',
          productPrice: 20.50,
          quantity: 1
        }
      ],
      subtotal: 20.50,
      shippingCost: 5.90,
      total: 26.40,
      idempotencyKey: `test-${Date.now()}`
    }

    const createPaymentResponse = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    })

    if (!createPaymentResponse.ok) {
      throw new Error(`Erreur création PaymentIntent: ${createPaymentResponse.status}`)
    }

    const paymentResult = await createPaymentResponse.json()
    console.log('✅ PaymentIntent créé:', {
      paymentIntentId: paymentResult.paymentIntentId,
      orderId: paymentResult.orderId,
      orderNumber: paymentResult.orderNumber
    })

    // 3. Vérifier que la commande a été créée
    console.log('\n3️⃣ Vérification de la commande créée...')
    const { data: createdOrder, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', paymentResult.orderId)
      .single()

    if (error) {
      throw new Error(`Erreur récupération commande: ${error.message}`)
    }

    console.log('✅ Commande créée:', {
      orderNumber: createdOrder.order_number,
      status: createdOrder.status,
      email: createdOrder.email,
      total: createdOrder.total,
      stripePaymentIntentId: createdOrder.stripe_payment_intent_id
    })

    // 4. Vérifier les order_items
    console.log('\n4️⃣ Vérification des articles de commande...')
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', paymentResult.orderId)

    if (itemsError) {
      throw new Error(`Erreur récupération order_items: ${itemsError.message}`)
    }

    console.log('✅ Articles de commande:', orderItems.map(item => ({
      productName: item.product_name,
      quantity: item.quantity,
      price: item.product_price,
      total: item.total
    })))

    // 5. Simuler un webhook de paiement réussi
    console.log('\n5️⃣ Simulation du webhook de paiement réussi...')
    
    const webhookPayload = {
      id: `evt_test_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentResult.paymentIntentId,
          amount: Math.round(testOrder.total * 100),
          currency: 'eur',
          status: 'succeeded',
          metadata: {
            order_id: paymentResult.orderId,
            order_number: paymentResult.orderNumber,
            email: testOrder.email,
            firstName: testOrder.firstName,
            lastName: testOrder.lastName
          }
        }
      }
    }

    const webhookResponse = await fetch(`${API_BASE_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      throw new Error(`Erreur webhook: ${webhookResponse.status}`)
    }

    console.log('✅ Webhook traité avec succès')

    // 6. Vérifier que la commande a été mise à jour
    console.log('\n6️⃣ Vérification de la mise à jour de la commande...')
    await new Promise(resolve => setTimeout(resolve, 2000)) // Attendre 2 secondes

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', paymentResult.orderId)
      .single()

    if (updateError) {
      throw new Error(`Erreur récupération commande mise à jour: ${updateError.message}`)
    }

    console.log('📊 Statut commande après webhook:', {
      orderNumber: updatedOrder.order_number,
      status: updatedOrder.status,
      stripePaymentIntentId: updatedOrder.stripe_payment_intent_id
    })

    // 7. Vérifier l'enregistrement du paiement
    console.log('\n7️⃣ Vérification de l\'enregistrement du paiement...')
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('provider_payment_id', paymentResult.paymentIntentId)
      .single()

    if (paymentError) {
      console.warn('⚠️ Aucun enregistrement de paiement trouvé:', paymentError.message)
    } else {
      console.log('✅ Paiement enregistré:', {
        orderId: payment.order_id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      })
    }

    // 8. Test de l'API de synchronisation
    console.log('\n8️⃣ Test de l\'API de synchronisation...')
    const syncCheckResponse = await fetch(`${API_BASE_URL}/api/sync-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode: 'check', limit: 10 })
    })

    if (syncCheckResponse.ok) {
      const syncResult = await syncCheckResponse.json()
      console.log('✅ Synchronisation testée:', syncResult)
    } else {
      console.warn('⚠️ Erreur test synchronisation:', syncCheckResponse.status)
    }

    console.log('\n🎉 SUCCÈS : Flux de commande complet testé avec succès!')
    console.log('=====================================')

    return {
      success: true,
      orderId: paymentResult.orderId,
      orderNumber: paymentResult.orderNumber,
      paymentIntentId: paymentResult.paymentIntentId,
      finalStatus: updatedOrder.status
    }

  } catch (error) {
    console.error('\n❌ ÉCHEC du test:', error.message)
    console.error('=====================================')
    return {
      success: false,
      error: error.message
    }
  }
}

// Exécuter le test si ce script est appelé directement
if (require.main === module) {
  testOrderFlow().then(result => {
    console.log('\n📋 Résultat final:', result)
    process.exit(result.success ? 0 : 1)
  })
}

module.exports = { testOrderFlow }