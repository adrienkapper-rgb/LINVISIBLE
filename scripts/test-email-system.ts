import { config } from 'dotenv'
import { 
  sendOrderConfirmationEmail, 
  sendPaymentConfirmationEmail, 
  sendAdminNotificationEmail,
  sendShippingNotificationEmail,
  sendDeliveryNotificationEmail 
} from '../lib/email/service'
import { Order, OrderItem } from '../lib/api/orders'

// Load environment variables
config({ path: '.env.local' })

// Mock order data for testing
const mockOrder: Order = {
  id: 'test-order-id',
  order_number: 'ORD-TEST-123456',
  customer_id: null,
  email: 'adrienkapper@gmail.com',
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '0123456789',
  mondial_relay_point: 'Point Relais Test - 123 Rue de la Paix, 75001 Paris',
  delivery_type: 'point-relais',
  delivery_address: null,
  delivery_postal_code: null,
  delivery_city: null,
  delivery_country: 'France',
  subtotal: 89.97,
  shipping_cost: 4.95,
  total: 94.92,
  status: 'pending',
  stripe_payment_intent_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockOrderItems: OrderItem[] = [
  {
    id: 'item-1',
    order_id: mockOrder.id,
    product_id: 'prod-1',
    product_name: 'French Mule',
    product_price: 29.99,
    quantity: 2,
    total: 59.98,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    order_id: mockOrder.id,
    product_id: 'prod-2',
    product_name: 'Mojito',
    product_price: 29.99,
    quantity: 1,
    total: 29.99,
    created_at: new Date().toISOString(),
  }
]

async function testEmailSystem() {
  console.log('🧪 Test du système d\'emails automatiques')
  console.log('=======================================')
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY n\'est pas configuré dans .env.local')
    return
  }

  const testData = { order: mockOrder, orderItems: mockOrderItems }
  
  try {
    // Test 1: Email de confirmation de commande
    console.log('\n1️⃣ Test email confirmation de commande...')
    await sendOrderConfirmationEmail(testData)
    console.log('✅ Email de confirmation envoyé')
    
    // Attendre un peu entre les emails
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test 2: Email de confirmation de paiement
    console.log('\n2️⃣ Test email confirmation de paiement...')
    const processingOrder = { ...mockOrder, status: 'processing' as const }
    await sendPaymentConfirmationEmail({ order: processingOrder, orderItems: mockOrderItems })
    console.log('✅ Email de confirmation paiement envoyé')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test 3: Email d'alerte admin
    console.log('\n3️⃣ Test email notification admin...')
    await sendAdminNotificationEmail(testData)
    console.log('✅ Email notification admin envoyé')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test 4: Email d'expédition
    console.log('\n4️⃣ Test email notification expédition...')
    const shippedOrder = { ...mockOrder, status: 'shipped' as const }
    await sendShippingNotificationEmail({ order: shippedOrder, orderItems: mockOrderItems })
    console.log('✅ Email d\'expédition envoyé')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test 5: Email de livraison
    console.log('\n5️⃣ Test email notification livraison...')
    const deliveredOrder = { ...mockOrder, status: 'delivered' as const }
    await sendDeliveryNotificationEmail({ order: deliveredOrder, orderItems: mockOrderItems })
    console.log('✅ Email de livraison envoyé')
    
    console.log('\n🎉 Tous les tests d\'emails sont terminés avec succès!')
    console.log('Vérifiez votre boîte mail et celle de l\'admin pour voir les emails reçus.')
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test des emails:', error)
  }
}

// Test avec livraison à domicile
async function testHomeDelivery() {
  console.log('\n🏠 Test avec livraison à domicile...')
  
  const homeDeliveryOrder: Order = {
    ...mockOrder,
    delivery_type: 'domicile',
    mondial_relay_point: null,
    delivery_address: '123 Avenue des Champs-Élysées',
    delivery_postal_code: '75008',
    delivery_city: 'Paris',
    delivery_country: 'France'
  }
  
  try {
    await sendOrderConfirmationEmail({ order: homeDeliveryOrder, orderItems: mockOrderItems })
    console.log('✅ Email confirmation livraison domicile envoyé')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const shippedHomeOrder = { ...homeDeliveryOrder, status: 'shipped' as const }
    await sendShippingNotificationEmail({ order: shippedHomeOrder, orderItems: mockOrderItems })
    console.log('✅ Email expédition livraison domicile envoyé')
    
  } catch (error) {
    console.error('❌ Erreur test livraison domicile:', error)
  }
}

// Exécuter les tests
async function runTests() {
  await testEmailSystem()
  await testHomeDelivery()
}

runTests().catch(console.error)