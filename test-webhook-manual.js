// Script pour tester manuellement le webhook en bypas de Stripe
// Usage: node test-webhook-manual.js

const testPaymentIntent = {
  id: 'pi_test_manual_' + Date.now(),
  amount: 5000, // 50 EUR en centimes
  currency: 'eur',
  status: 'succeeded'
}

const testEvent = {
  id: 'evt_test_' + Date.now(),
  type: 'payment_intent.succeeded',
  data: {
    object: testPaymentIntent
  }
}

async function testWebhook() {
  try {
    console.log('🧪 Test manuel du webhook...')
    
    const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // En mode dev, la signature n'est pas vérifiée
      },
      body: JSON.stringify(testEvent)
    })
    
    const result = await response.text()
    console.log('📊 Status:', response.status)
    console.log('📄 Response:', result)
    
    if (response.ok) {
      console.log('✅ Webhook a répondu correctement')
    } else {
      console.log('❌ Erreur webhook:', response.status)
    }
    
  } catch (error) {
    console.error('❌ Erreur test webhook:', error)
  }
}

testWebhook()
