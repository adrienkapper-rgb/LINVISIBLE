// Test complet du flux d'email avec création de commande et simulation webhook
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rnxhkjvcixumuvjfxdjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGhranZjaXh1bXV2amZ4ZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODI2NjAsImV4cCI6MjA3MTM1ODY2MH0.J_J78PV9oY4slnH6XPAE_0Bf-SJf2ggftQeXJhMAIqg';
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestOrder() {
  console.log('📦 Création d\'une commande de test...');
  
  const orderNumber = `TEST-${Date.now()}`;
  const paymentIntentId = `pi_test_${Date.now()}`;
  
  // Créer une commande de test
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      email: 'adrienkapper@gmail.com',
      first_name: 'Test',
      last_name: 'Email',
      phone: '0601020304',
      delivery_type: 'domicile',
      delivery_address: '123 Rue de Test',
      delivery_postal_code: '75001',
      delivery_city: 'Paris',
      delivery_country: 'FR',
      subtotal: 45,
      shipping_cost: 10,
      total: 55,
      status: 'pending',
      stripe_payment_intent_id: paymentIntentId
    })
    .select()
    .single();
  
  if (orderError) {
    console.error('❌ Erreur création commande:', orderError);
    return null;
  }
  
  console.log('✅ Commande créée:', order.order_number);
  console.log('🆔 Order ID:', order.id);
  console.log('💳 PaymentIntent ID:', paymentIntentId);
  
  // Créer des articles de test
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert([
      {
        order_id: order.id,
        product_name: 'Cocktail Test 1',
        product_price: 25,
        quantity: 1,
        total: 25
      },
      {
        order_id: order.id,
        product_name: 'Cocktail Test 2',
        product_price: 20,
        quantity: 1,
        total: 20
      }
    ]);
  
  if (itemsError) {
    console.error('❌ Erreur création articles:', itemsError);
    return null;
  }
  
  console.log('✅ Articles créés');
  
  return { order, paymentIntentId };
}

async function simulateWebhook(paymentIntentId, orderMetadata) {
  console.log('\n🔔 Simulation du webhook Stripe...');
  
  const webhookPayload = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'payment_intent.succeeded',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 5500, // 55€
        currency: 'eur',
        status: 'succeeded',
        metadata: orderMetadata || {}
      }
    }
  };
  
  console.log('📤 Envoi du webhook à:', WEBHOOK_URL);
  console.log('💳 PaymentIntent:', paymentIntentId);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // Mode test
      },
      body: JSON.stringify(webhookPayload)
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
      return true;
    } else {
      console.error('❌ Erreur webhook:', responseData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur appel webhook:', error);
    return false;
  }
}

async function checkOrderStatus(orderId) {
  console.log('\n🔍 Vérification du statut de la commande...');
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (error) {
    console.error('❌ Erreur récupération commande:', error);
    return;
  }
  
  console.log('📋 Statut actuel:', order.status);
  console.log('💳 PaymentIntent ID:', order.stripe_payment_intent_id);
  
  if (order.status === 'processing') {
    console.log('✅ La commande est bien passée en statut "processing"!');
  } else {
    console.log('⚠️ Le statut n\'a pas été mis à jour');
  }
  
  return order;
}

async function runCompleteTest() {
  console.log('🚀 TEST COMPLET DU FLUX D\'EMAILS');
  console.log('================================\n');
  
  // 1. Créer une commande de test
  const result = await createTestOrder();
  if (!result) {
    console.error('❌ Impossible de créer la commande de test');
    return;
  }
  
  const { order, paymentIntentId } = result;
  
  // 2. Attendre un peu pour que la base soit synchronisée
  console.log('\n⏳ Attente de 2 secondes...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Simuler le webhook Stripe
  const webhookSuccess = await simulateWebhook(paymentIntentId, {
    order_id: order.id,
    order_number: order.order_number
  });
  
  if (!webhookSuccess) {
    console.error('❌ Le webhook a échoué');
    return;
  }
  
  // 4. Attendre un peu pour que les emails soient envoyés
  console.log('\n⏳ Attente de 3 secondes pour l\'envoi des emails...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 5. Vérifier le statut de la commande
  await checkOrderStatus(order.id);
  
  console.log('\n📧 RÉSULTAT ATTENDU:');
  console.log('-------------------');
  console.log('✉️ Un email de confirmation devrait être envoyé à:', order.email);
  console.log('✉️ Un email admin devrait être envoyé à: adrienkapper@gmail.com');
  console.log('\n💡 Vérifiez vos boîtes mail!');
  console.log('   - Email de confirmation pour le client');
  console.log('   - Notification admin de nouvelle commande');
  
  // 6. Nettoyer (optionnel)
  console.log('\n🧹 Pour nettoyer la commande de test:');
  console.log(`DELETE FROM order_items WHERE order_id = '${order.id}';`);
  console.log(`DELETE FROM orders WHERE id = '${order.id}';`);
}

// Lancer le test complet
runCompleteTest().catch(console.error);