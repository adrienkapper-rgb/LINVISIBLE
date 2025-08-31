// Test script to verify email functionality
const { createOrder } = require('./lib/api/orders.ts');

async function testEmailSystem() {
  console.log('🧪 Testing email system...');
  
  const testOrderData = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '+33123456789',
    deliveryType: 'domicile',
    deliveryAddress: '123 Test Street',
    deliveryPostalCode: '33000',
    deliveryCity: 'Bordeaux',
    deliveryCountry: 'FR',
    items: [
      {
        productId: 'test-product-1',
        productName: 'Test Cocktail',
        productPrice: 15.00,
        quantity: 2
      }
    ],
    subtotal: 30.00,
    shippingCost: 5.00,
    total: 35.00
  };
  
  try {
    const result = await createOrder(testOrderData);
    
    if (result.error) {
      console.error('❌ Error creating test order:', result.error);
      return;
    }
    
    console.log('✅ Test order created successfully:', result.order.order_number);
    console.log('📧 Check if emails were sent (look for email logs in the output)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailSystem();