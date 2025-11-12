import { calculateTotalWeight, getShippingInfo } from './lib/shipping/mondial-relay-pricing';

console.log('=== TEST LIMITE LIVRAISON À DOMICILE (25kg) ===\n');

// Simuler des items du panier
const createCartItems = (quantity: number) => [{
  product: { weight: 1050 },
  quantity
}];

console.log('🔍 TESTS POUR FRANCE:\n');

// Test avec 21 bouteilles (devrait fonctionner)
console.log('21 BOUTEILLES (limite théorique):');
const weight21 = calculateTotalWeight(createCartItems(21) as any);
console.log(`  Poids total: ${weight21}g (${(weight21 / 1000).toFixed(1)}kg)`);
try {
  const infoPointRelais21 = getShippingInfo(weight21, 'FR', true);
  const infoDomicile21 = getShippingInfo(weight21, 'FR', false);
  console.log(`  ✓ Point Relais: ${infoPointRelais21.cost.toFixed(2)}€`);
  console.log(`  ✓ Domicile:     ${infoDomicile21.cost.toFixed(2)}€`);
} catch (error: any) {
  console.log(`  ❌ Erreur: ${error.message}`);
}
console.log('');

// Test avec 22 bouteilles (25.4kg - devrait fonctionner en limite)
console.log('22 BOUTEILLES:');
const weight22 = calculateTotalWeight(createCartItems(22) as any);
console.log(`  Poids total: ${weight22}g (${(weight22 / 1000).toFixed(1)}kg)`);
try {
  const infoPointRelais22 = getShippingInfo(weight22, 'FR', true);
  console.log(`  ✓ Point Relais: ${infoPointRelais22.cost.toFixed(2)}€`);
} catch (error: any) {
  console.log(`  ❌ Point Relais erreur: ${error.message}`);
}
try {
  const infoDomicile22 = getShippingInfo(weight22, 'FR', false);
  console.log(`  ✓ Domicile:     ${infoDomicile22.cost.toFixed(2)}€`);
} catch (error: any) {
  console.log(`  ❌ Domicile erreur: ${error.message}`);
}
console.log('');

// Test avec 25 bouteilles (28.1kg - devrait échouer en domicile)
console.log('25 BOUTEILLES (BUG ORIGINAL):');
const weight25 = calculateTotalWeight(createCartItems(25) as any);
console.log(`  Poids total: ${weight25}g (${(weight25 / 1000).toFixed(1)}kg)`);
try {
  const infoPointRelais25 = getShippingInfo(weight25, 'FR', true);
  console.log(`  ✓ Point Relais: ${infoPointRelais25.cost.toFixed(2)}€ (devrait être 32.40€)`);
} catch (error: any) {
  console.log(`  ❌ Point Relais erreur: ${error.message}`);
}
try {
  const infoDomicile25 = getShippingInfo(weight25, 'FR', false);
  console.log(`  ❌ PROBLÈME: Domicile retourne ${infoDomicile25.cost.toFixed(2)}€ (ne devrait pas être possible)`);
} catch (error: any) {
  console.log(`  ✓ Domicile bloqué correctement: ${error.message}`);
}
console.log('');

// Test avec 30 bouteilles (33.6kg - devrait échouer même en Point Relais)
console.log('30 BOUTEILLES (au-delà limite Point Relais):');
const weight30 = calculateTotalWeight(createCartItems(30) as any);
console.log(`  Poids total: ${weight30}g (${(weight30 / 1000).toFixed(1)}kg)`);
try {
  const infoPointRelais30 = getShippingInfo(weight30, 'FR', true);
  console.log(`  ❌ PROBLÈME: Point Relais retourne ${infoPointRelais30.cost.toFixed(2)}€ (ne devrait pas être possible)`);
} catch (error: any) {
  console.log(`  ✓ Point Relais bloqué correctement: ${error.message}`);
}
try {
  const infoDomicile30 = getShippingInfo(weight30, 'FR', false);
  console.log(`  ❌ PROBLÈME: Domicile retourne ${infoDomicile30.cost.toFixed(2)}€ (ne devrait pas être possible)`);
} catch (error: any) {
  console.log(`  ✓ Domicile bloqué correctement: ${error.message}`);
}

console.log('\n✅ Tests terminés !');
console.log('\n📋 RÉSUMÉ:');
console.log('  • Point Relais France: max 30kg');
console.log('  • Domicile France: max 25kg (environ 21 bouteilles)');
console.log('  • 1 bouteille = 1050g + boîtes 200g (max 3 bouteilles/boîte)');
