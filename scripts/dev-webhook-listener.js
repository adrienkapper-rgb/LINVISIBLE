#!/usr/bin/env node

/**
 * Alternative à Stripe CLI pour le développement local
 * Ce script simule le comportement de "stripe listen --forward-to localhost:3000"
 * en permettant de recevoir et tester les webhooks manuellement
 */

const crypto = require('crypto');
const readline = require('readline');

// Configuration - Utilise le même secret que la production
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_Z7XHqvtCMW3Tnq4Tqy11nvfABRlfx6cJ';
const LOCAL_URL = 'http://localhost:3000/api/webhooks/stripe';

console.log('🚀 Stripe Webhook Development Listener');
console.log('=====================================');
console.log('');
console.log('🔧 Utilise le même secret que la production Vercel');
console.log(`📋 Webhook Secret: ${WEBHOOK_SECRET.substring(0, 20)}...`);
console.log('');
console.log('✅ Signatures identiques à la production pour des tests réalistes');
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour créer une signature Stripe valide
function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const elements = timestamp + '.' + payload;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(elements)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Fonction pour envoyer un webhook de test
async function sendWebhook(eventType, paymentIntentId, metadata = {}) {
  const webhookPayload = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2020-08-27',
    created: Math.floor(Date.now() / 1000),
    type: eventType,
    data: {
      object: {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 2640, // 26.40 EUR en centimes
        currency: 'eur',
        status: eventType === 'payment_intent.succeeded' ? 'succeeded' : 'failed',
        metadata: metadata
      }
    }
  };

  const payloadString = JSON.stringify(webhookPayload);
  const signature = createStripeSignature(payloadString, WEBHOOK_SECRET);

  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log(`📡 Envoi du webhook ${eventType}...`);
    console.log(`🎯 PaymentIntent: ${paymentIntentId}`);
    
    const response = await fetch(LOCAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature
      },
      body: payloadString
    });

    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Webhook envoyé avec succès!');
      console.log(`📊 Réponse: ${result}`);
    } else {
      console.log('❌ Erreur webhook:');
      console.log(`📊 Status: ${response.status}`);
      console.log(`📊 Réponse: ${result}`);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:');
    console.log(error.message);
  }
}

// Interface interactive
function showMenu() {
  console.log('');
  console.log('🎛️ Commandes disponibles:');
  console.log('1. success <payment_intent_id> - Simuler un paiement réussi');
  console.log('2. failed <payment_intent_id> - Simuler un paiement échoué');  
  console.log('3. help - Afficher cette aide');
  console.log('4. quit - Quitter');
  console.log('');
  console.log('💡 Exemple: success pi_1234567890');
  console.log('');
}

async function handleCommand(input) {
  const [command, paymentIntentId, ...args] = input.trim().split(' ');
  
  switch (command.toLowerCase()) {
    case '1':
    case 'success':
      if (!paymentIntentId) {
        console.log('❌ PaymentIntent ID requis. Exemple: success pi_1234567890');
        return;
      }
      await sendWebhook('payment_intent.succeeded', paymentIntentId, {
        test_mode: 'true',
        source: 'dev_webhook_listener'
      });
      break;
      
    case '2':
    case 'failed':
      if (!paymentIntentId) {
        console.log('❌ PaymentIntent ID requis. Exemple: failed pi_1234567890');
        return;
      }
      await sendWebhook('payment_intent.payment_failed', paymentIntentId, {
        test_mode: 'true',
        source: 'dev_webhook_listener'
      });
      break;
      
    case '3':
    case 'help':
      showMenu();
      break;
      
    case '4':
    case 'quit':
    case 'exit':
      console.log('👋 Au revoir!');
      rl.close();
      return;
      
    default:
      console.log('❌ Commande non reconnue. Tapez "help" pour voir les commandes disponibles.');
  }
}

// Démarrage
showMenu();

console.log('💬 Tapez une commande:');
rl.on('line', async (input) => {
  await handleCommand(input);
  console.log('💬 Tapez une commande:');
});

rl.on('close', () => {
  process.exit(0);
});