import { calculateTotalWeight, getShippingInfo } from './lib/shipping/mondial-relay-pricing';

console.log('=== TEST TARIFS LIVRAISON À DOMICILE ===\n');

// Simuler des items du panier
const createCartItems = (quantity: number) => [{
  product: { weight: 1050 },
  quantity
}];

// Test avec différentes quantités pour livraison à domicile
console.log('🏠 FRANCE DOMICILE:\n');

for (const qty of [1, 2, 3, 4, 5, 6]) {
  const weight = calculateTotalWeight(createCartItems(qty) as any);
  const infoPointRelais = getShippingInfo(weight, 'FR', true);
  const infoDomicile = getShippingInfo(weight, 'FR', false);

  console.log(`${qty} bouteille(s) - ${weight}g (${infoPointRelais.formattedWeight}):`);
  console.log(`  Point Relais: ${infoPointRelais.cost.toFixed(2)}€`);
  console.log(`  Domicile:     ${infoDomicile.cost.toFixed(2)}€`);
  console.log('');
}

console.log('\n📊 DÉTAILS POUR 3 BOUTEILLES:');
const weight3 = calculateTotalWeight(createCartItems(3) as any);
const info3 = getShippingInfo(weight3, 'FR', false);
console.log(`Poids: ${weight3}g (${info3.formattedWeight})`);
console.log(`Service: ${info3.service}`);
console.log(`Coût: ${info3.cost}€`);
console.log(`Délai: ${info3.deliveryTime}`);
