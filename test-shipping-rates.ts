import { calculateShippingCost, getShippingInfo } from './lib/shipping/mondial-relay-pricing';

console.log('=== TESTS TARIFS MONDIAL RELAY 2025 ===\n');

console.log('📦 FRANCE POINT RELAIS:');
console.log('  100g:   ', calculateShippingCost(100, 'FR', true), '€ (attendu: 4.19€)');
console.log('  300g:   ', calculateShippingCost(300, 'FR', true), '€ (attendu: 4.30€)');
console.log('  800g:   ', calculateShippingCost(800, 'FR', true), '€ (attendu: 5.39€)');
console.log('  1500g:  ', calculateShippingCost(1500, 'FR', true), '€ (attendu: 6.59€)');
console.log('  2500g:  ', calculateShippingCost(2500, 'FR', true), '€ (attendu: 7.40€)');
console.log('  5000g:  ', calculateShippingCost(5000, 'FR', true), '€ (attendu: 12.40€)');
console.log('  10000g: ', calculateShippingCost(10000, 'FR', true), '€ (attendu: 14.40€)');

console.log('\n🏠 FRANCE DOMICILE:');
console.log('  100g:   ', calculateShippingCost(100, 'FR', false), '€ (attendu: 4.99€)');
console.log('  400g:   ', calculateShippingCost(400, 'FR', false), '€ (attendu: 6.79€)');
console.log('  600g:   ', calculateShippingCost(600, 'FR', false), '€ (attendu: 8.56€)');
console.log('  900g:   ', calculateShippingCost(900, 'FR', false), '€ (attendu: 8.80€)');
console.log('  1500g:  ', calculateShippingCost(1500, 'FR', false), '€ (attendu: 10.00€)');
console.log('  2500g:  ', calculateShippingCost(2500, 'FR', false), '€ (attendu: 14.99€)');

console.log('\n🇪🇺 BELGIQUE POINT RELAIS:');
console.log('  200g:   ', calculateShippingCost(200, 'BE', true), '€ (attendu: 4.60€)');
console.log('  800g:   ', calculateShippingCost(800, 'BE', true), '€ (attendu: 5.90€)');
console.log('  1500g:  ', calculateShippingCost(1500, 'BE', true), '€ (attendu: 8.20€)');

console.log('\n🇪🇺 BELGIQUE DOMICILE:');
console.log('  200g:   ', calculateShippingCost(200, 'BE', false), '€ (attendu: 12.07€)');
console.log('  900g:   ', calculateShippingCost(900, 'BE', false), '€ (attendu: 13.55€)');
console.log('  1500g:  ', calculateShippingCost(1500, 'BE', false), '€ (attendu: 13.55€)');
console.log('  2500g:  ', calculateShippingCost(2500, 'BE', false), '€ (attendu: 15.65€)');

const info = getShippingInfo(1500, 'FR', true);
console.log('\n📊 Détails livraison 1.5kg France Point Relais:');
console.log('  Service:', info.service);
console.log('  Coût:', info.cost, '€');
console.log('  Poids:', info.formattedWeight);
console.log('  Délai:', info.deliveryTime);
console.log('  Nombre de colis:', info.packageCount);

console.log('\n✅ Tous les tests terminés !');
