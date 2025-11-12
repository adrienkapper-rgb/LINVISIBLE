import { calculateTotalWeight, getShippingInfo } from './lib/shipping/mondial-relay-pricing';

console.log('=== TESTS CALCUL POIDS AVEC BOÎTES ===\n');
console.log('Règle: 1 bouteille = 1050g, 1 boîte = 200g (max 3 bouteilles/boîte)\n');

// Simuler des items du panier
const createCartItems = (quantity: number) => [{
  product: { weight: 1050 }, // Le poids unitaire n'est plus utilisé
  quantity
}];

// Test 1 bouteille
console.log('📦 1 BOUTEILLE:');
const weight1 = calculateTotalWeight(createCartItems(1) as any);
const info1 = getShippingInfo(weight1, 'FR', true);
console.log(`  Calcul: 1 × 1050g + 1 boîte × 200g = ${weight1}g`);
console.log(`  Poids formaté: ${info1.formattedWeight}`);
console.log(`  Coût livraison: ${info1.cost}€`);
console.log(`  ✓ Attendu: 1250g (1.3 kg)\n`);

// Test 3 bouteilles
console.log('📦 3 BOUTEILLES:');
const weight3 = calculateTotalWeight(createCartItems(3) as any);
const info3 = getShippingInfo(weight3, 'FR', true);
console.log(`  Calcul: 3 × 1050g + 1 boîte × 200g = ${weight3}g`);
console.log(`  Poids formaté: ${info3.formattedWeight}`);
console.log(`  Coût livraison: ${info3.cost}€`);
console.log(`  ✓ Attendu: 3350g (3.4 kg)\n`);

// Test 4 bouteilles
console.log('📦 4 BOUTEILLES:');
const weight4 = calculateTotalWeight(createCartItems(4) as any);
const info4 = getShippingInfo(weight4, 'FR', true);
console.log(`  Calcul: 4 × 1050g + 2 boîtes × 200g = ${weight4}g`);
console.log(`  Poids formaté: ${info4.formattedWeight}`);
console.log(`  Coût livraison: ${info4.cost}€`);
console.log(`  ✓ Attendu: 4600g (4.6 kg)\n`);

// Test 6 bouteilles
console.log('📦 6 BOUTEILLES:');
const weight6 = calculateTotalWeight(createCartItems(6) as any);
const info6 = getShippingInfo(weight6, 'FR', true);
console.log(`  Calcul: 6 × 1050g + 2 boîtes × 200g = ${weight6}g`);
console.log(`  Poids formaté: ${info6.formattedWeight}`);
console.log(`  Coût livraison: ${info6.cost}€`);
console.log(`  ✓ Attendu: 6700g (6.7 kg)\n`);

// Test 7 bouteilles
console.log('📦 7 BOUTEILLES:');
const weight7 = calculateTotalWeight(createCartItems(7) as any);
const info7 = getShippingInfo(weight7, 'FR', true);
console.log(`  Calcul: 7 × 1050g + 3 boîtes × 200g = ${weight7}g`);
console.log(`  Poids formaté: ${info7.formattedWeight}`);
console.log(`  Coût livraison: ${info7.cost}€`);
console.log(`  ✓ Attendu: 7950g (8.0 kg)\n`);

console.log('✅ Tous les tests terminés !');
