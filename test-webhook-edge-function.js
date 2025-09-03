// Script pour tester le webhook Stripe directement avec l'edge function
const crypto = require('crypto');

const SUPABASE_URL = 'https://rnxhkjvcixumuvjfxdjo.supabase.co';
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

// Payload de test pour un paiement réussi
const testPayload = {
  id: 'evt_test_webhook_' + Date.now(),
  object: 'event',
  type: 'payment_intent.succeeded',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'pi_test_' + Date.now(),
      object: 'payment_intent',
      amount: 5500, // 55€
      currency: 'eur',
      status: 'succeeded',
      metadata: {
        order_number: 'TEST-ORDER-' + Date.now(),
        order_id: 'test-order-id-123',
        email: 'adrienkapper@gmail.com',
        firstName: 'Test',
        lastName: 'Client',
        phone: '0601020304'
      }
    }
  }
};

async function testWebhook() {
  console.log('🚀 Test du webhook Stripe Edge Function');
  console.log('📍 URL:', WEBHOOK_URL);
  console.log('📦 Event type:', testPayload.type);
  console.log('💳 Payment Intent ID:', testPayload.data.object.id);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // Mode test
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    console.log('📨 Response status:', response.status);
    console.log('📝 Response:', responseData);
    
    if (response.ok) {
      console.log('✅ Webhook traité avec succès!');
      console.log('');
      console.log('⚠️  Note importante:');
      console.log('   Ce test simule uniquement l\'appel du webhook.');
      console.log('   Pour un test complet, vous devez:');
      console.log('   1. Avoir une commande dans la base avec le PaymentIntent ID correspondant');
      console.log('   2. Ou utiliser les metadata pour retrouver la commande');
      console.log('');
      console.log('💡 Pour tester avec une vraie commande:');
      console.log('   1. Créez une commande via l\'interface');
      console.log('   2. Notez le PaymentIntent ID après le paiement');
      console.log('   3. Modifiez ce script avec le vrai PaymentIntent ID');
    } else {
      console.error('❌ Erreur lors du traitement du webhook');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel:', error);
  }
}

// Test avec une vraie commande (optionnel)
async function testWithRealOrder(paymentIntentId, orderNumber) {
  console.log('🔄 Test avec une vraie commande');
  
  const realPayload = {
    ...testPayload,
    data: {
      object: {
        ...testPayload.data.object,
        id: paymentIntentId,
        metadata: {
          ...testPayload.data.object.metadata,
          order_number: orderNumber
        }
      }
    }
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(realPayload)
    });
    
    const responseData = await response.json();
    console.log('📨 Response:', responseData);
    
    if (response.ok) {
      console.log('✅ Emails devraient être envoyés!');
      console.log('📧 Vérifiez votre boîte mail et celle de l\'admin');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer le test
testWebhook();

// Pour tester avec une vraie commande, décommentez et remplacez les valeurs:
// testWithRealOrder('pi_xxxxx', 'ORD-xxxxx');