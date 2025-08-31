// Test script pour créer une commande fictive et vérifier l'envoi des emails
import fetch from 'node-fetch';

const testOrderData = {
  email: 'test@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '+33123456789',
  deliveryType: 'domicile',
  deliveryAddress: '123 Rue de Test',
  deliveryPostalCode: '33000',
  deliveryCity: 'Bordeaux',
  deliveryCountry: 'FR',
  items: [
    {
      productId: 'test-product-1',
      productName: 'Cocktail de Test',
      productPrice: 15.00,
      quantity: 2,
      total: 30.00
    }
  ],
  subtotal: 30.00,
  shippingCost: 5.00,
  total: 35.00
};

async function createTestOrder() {
  console.log('🧪 Création d\'une commande de test...');
  
  try {
    const response = await fetch('http://localhost:3011/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData)
    });
    
    const result = await response.text();
    console.log('📋 Réponse API:', result);
    
    if (response.ok) {
      console.log('✅ Commande de test créée avec succès');
      console.log('📧 Vérifiez les logs pour voir si les emails ont été envoyés');
    } else {
      console.error('❌ Erreur lors de la création de la commande:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
  }
}

createTestOrder();