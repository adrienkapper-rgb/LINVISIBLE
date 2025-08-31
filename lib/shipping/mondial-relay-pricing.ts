// Service de calcul de tarifs Mondial Relay basé sur le poids et le pays de destination

interface ShippingRate {
  minWeight: number; // en grammes
  maxWeight: number; // en grammes
  price: number; // en euros
}

interface CountryShippingConfig {
  code: string;
  name: string;
  pointRelaisAvailable: boolean; // Point Relais disponible
  homeDeliveryAvailable: boolean; // Livraison à domicile disponible
  maxWeight: number; // Poids maximum en grammes
  pointRelaisRates?: ShippingRate[]; // Tarifs Point Relais
  homeDeliveryRates?: ShippingRate[]; // Tarifs livraison à domicile
  deliveryTime: string; // Délai de livraison
}

// Grille tarifaire Point Relais France 2025
const FRANCE_POINT_RELAIS_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 500, price: 3.89 },
  { minWeight: 501, maxWeight: 1000, price: 4.20 },
  { minWeight: 1001, maxWeight: 1500, price: 4.90 },
  { minWeight: 1501, maxWeight: 2000, price: 5.60 },
  { minWeight: 2001, maxWeight: 3000, price: 6.30 },
  { minWeight: 3001, maxWeight: 4000, price: 7.00 },
  { minWeight: 4001, maxWeight: 5000, price: 7.70 },
  { minWeight: 5001, maxWeight: 7000, price: 8.90 },
  { minWeight: 7001, maxWeight: 10000, price: 10.50 },
  { minWeight: 10001, maxWeight: 15000, price: 13.20 },
  { minWeight: 15001, maxWeight: 20000, price: 16.80 },
  { minWeight: 20001, maxWeight: 25000, price: 20.40 },
  { minWeight: 25001, maxWeight: 30000, price: 24.00 }
];

// Grille tarifaire Livraison à Domicile France 2025 (nouveau service)
const FRANCE_HOME_DELIVERY_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 250, price: 4.99 },
  { minWeight: 251, maxWeight: 500, price: 6.50 },
  { minWeight: 501, maxWeight: 1000, price: 8.79 },
  { minWeight: 1001, maxWeight: 1500, price: 9.90 },
  { minWeight: 1501, maxWeight: 2000, price: 11.50 },
  { minWeight: 2001, maxWeight: 3000, price: 13.20 },
  { minWeight: 3001, maxWeight: 4000, price: 15.80 },
  { minWeight: 4001, maxWeight: 5000, price: 17.90 },
  { minWeight: 5001, maxWeight: 7000, price: 21.50 },
  { minWeight: 7001, maxWeight: 10000, price: 25.90 },
  { minWeight: 10001, maxWeight: 15000, price: 32.50 },
  { minWeight: 15001, maxWeight: 20000, price: 38.90 },
  { minWeight: 20001, maxWeight: 25000, price: 45.20 },
  { minWeight: 25001, maxWeight: 30000, price: 52.90 }
];

// Grille tarifaire Point Relais pour pays européens
const EUROPE_POINT_RELAIS_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 500, price: 5.90 },
  { minWeight: 501, maxWeight: 1000, price: 6.50 },
  { minWeight: 1001, maxWeight: 1500, price: 7.20 },
  { minWeight: 1501, maxWeight: 2000, price: 8.90 },
  { minWeight: 2001, maxWeight: 3000, price: 10.20 },
  { minWeight: 3001, maxWeight: 4000, price: 11.50 },
  { minWeight: 4001, maxWeight: 5000, price: 12.80 },
  { minWeight: 5001, maxWeight: 7000, price: 15.40 },
  { minWeight: 7001, maxWeight: 10000, price: 18.90 },
  { minWeight: 10001, maxWeight: 15000, price: 24.50 },
  { minWeight: 15001, maxWeight: 20000, price: 29.90 },
  { minWeight: 20001, maxWeight: 25000, price: 34.90 }
];

// Grille tarifaire livraison à domicile pour pays européens
const EUROPE_HOME_DELIVERY_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 500, price: 8.90 },
  { minWeight: 501, maxWeight: 1000, price: 9.50 },
  { minWeight: 1001, maxWeight: 1500, price: 10.80 },
  { minWeight: 1501, maxWeight: 2000, price: 12.50 },
  { minWeight: 2001, maxWeight: 3000, price: 14.20 },
  { minWeight: 3001, maxWeight: 4000, price: 16.90 },
  { minWeight: 4001, maxWeight: 5000, price: 18.60 },
  { minWeight: 5001, maxWeight: 7000, price: 22.40 },
  { minWeight: 7001, maxWeight: 10000, price: 26.90 },
  { minWeight: 10001, maxWeight: 15000, price: 34.50 },
  { minWeight: 15001, maxWeight: 20000, price: 42.90 }
];

// Configuration des pays supportés
export const SUPPORTED_COUNTRIES: Record<string, CountryShippingConfig> = {
  FR: {
    code: 'FR',
    name: 'France',
    pointRelaisAvailable: true,
    homeDeliveryAvailable: true, // ✅ Nouveau service 2025
    maxWeight: 30000,
    pointRelaisRates: FRANCE_POINT_RELAIS_RATES,
    homeDeliveryRates: FRANCE_HOME_DELIVERY_RATES,
    deliveryTime: '3-5 jours ouvrés'
  },
  BE: {
    code: 'BE',
    name: 'Belgique',
    pointRelaisAvailable: true,
    homeDeliveryAvailable: true,
    maxWeight: 25000,
    pointRelaisRates: EUROPE_POINT_RELAIS_RATES,
    homeDeliveryRates: EUROPE_HOME_DELIVERY_RATES,
    deliveryTime: '3-4 jours ouvrés'
  },
  ES: {
    code: 'ES',
    name: 'Espagne',
    pointRelaisAvailable: true,
    homeDeliveryAvailable: true,
    maxWeight: 25000,
    pointRelaisRates: EUROPE_POINT_RELAIS_RATES,
    homeDeliveryRates: EUROPE_HOME_DELIVERY_RATES,
    deliveryTime: '3-4 jours ouvrés'
  },
  LU: {
    code: 'LU',
    name: 'Luxembourg',
    pointRelaisAvailable: true,
    homeDeliveryAvailable: true,
    maxWeight: 25000,
    pointRelaisRates: EUROPE_POINT_RELAIS_RATES,
    homeDeliveryRates: EUROPE_HOME_DELIVERY_RATES,
    deliveryTime: '3-4 jours ouvrés'
  },
  NL: {
    code: 'NL',
    name: 'Pays-Bas',
    pointRelaisAvailable: true,
    homeDeliveryAvailable: true,
    maxWeight: 25000,
    pointRelaisRates: EUROPE_POINT_RELAIS_RATES,
    homeDeliveryRates: EUROPE_HOME_DELIVERY_RATES,
    deliveryTime: '3-4 jours ouvrés'
  },
  DE: {
    code: 'DE',
    name: 'Allemagne',
    pointRelaisAvailable: false,
    homeDeliveryAvailable: true,
    maxWeight: 20000,
    homeDeliveryRates: EUROPE_HOME_DELIVERY_RATES,
    deliveryTime: '3-6 jours ouvrés'
  },
  IT: {
    code: 'IT',
    name: 'Italie',
    pointRelaisAvailable: false,
    homeDeliveryAvailable: true,
    maxWeight: 25000,
    homeDeliveryRates: EUROPE_HOME_DELIVERY_RATES,
    deliveryTime: '3-6 jours ouvrés'
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    pointRelaisAvailable: false,
    homeDeliveryAvailable: true,
    maxWeight: 25000,
    homeDeliveryRates: EUROPE_HOME_DELIVERY_RATES,
    deliveryTime: '3-6 jours ouvrés'
  }
};

interface CartItem {
  product: {
    weight: number;
  };
  quantity: number;
}

export function calculateTotalWeight(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.product.weight * item.quantity);
  }, 0);
}

export function calculateShippingCost(
  totalWeightInGrams: number, 
  countryCode: string = 'FR', 
  preferPointRelais: boolean = true
): number {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) {
    throw new Error(`Pays non supporté: ${countryCode}`);
  }

  // Ajouter 100g pour l'emballage
  const packageWeight = totalWeightInGrams + 100;
  
  // Déterminer le service et les tarifs à utiliser
  let rates: ShippingRate[];
  if (preferPointRelais && country.pointRelaisAvailable && country.pointRelaisRates) {
    rates = country.pointRelaisRates;
  } else if (country.homeDeliveryAvailable && country.homeDeliveryRates) {
    rates = country.homeDeliveryRates;
  } else {
    throw new Error(`Aucun service de livraison disponible pour ${country.name}`);
  }
  
  // Trouver la tranche tarifaire correspondante
  const rate = rates.find(rate => 
    packageWeight >= rate.minWeight && packageWeight <= rate.maxWeight
  );
  
  // Vérifier les limites de poids
  if (!rate) {
    if (packageWeight > country.maxWeight) {
      throw new Error(`Le colis dépasse le poids maximum autorisé de ${country.maxWeight/1000}kg pour ${country.name}`);
    }
    // Pour les poids très légers non couverts, utiliser le premier tarif
    return rates[0].price;
  }
  
  return rate.price;
}

export function getShippingInfo(
  totalWeightInGrams: number, 
  countryCode: string = 'FR', 
  preferPointRelais: boolean = true
): {
  weight: number;
  cost: number;
  formattedWeight: string;
  service: 'point-relais' | 'domicile';
  deliveryTime: string;
  country: CountryShippingConfig;
} {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) {
    throw new Error(`Pays non supporté: ${countryCode}`);
  }

  const packageWeight = totalWeightInGrams + 100; // Ajout emballage
  const cost = calculateShippingCost(totalWeightInGrams, countryCode, preferPointRelais);
  
  // Déterminer le service utilisé
  const service = (preferPointRelais && country.pointRelaisAvailable) ? 'point-relais' : 'domicile';
  
  return {
    weight: packageWeight,
    cost: cost,
    formattedWeight: packageWeight >= 1000 
      ? `${(packageWeight / 1000).toFixed(1)} kg`
      : `${packageWeight} g`,
    service,
    deliveryTime: country.deliveryTime,
    country
  };
}

export function validatePackageWeight(
  totalWeightInGrams: number, 
  countryCode: string = 'FR'
): {
  isValid: boolean;
  error?: string;
} {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) {
    return {
      isValid: false,
      error: `Pays non supporté: ${countryCode}`
    };
  }

  const packageWeight = totalWeightInGrams + 100;
  
  if (packageWeight > country.maxWeight) {
    return {
      isValid: false,
      error: `Le colis dépasse le poids maximum autorisé de ${country.maxWeight/1000}kg pour la livraison vers ${country.name}`
    };
  }
  
  if (packageWeight <= 0) {
    return {
      isValid: false,
      error: 'Le poids du colis doit être supérieur à 0'
    };
  }
  
  return { isValid: true };
}

export function getAvailableServices(countryCode: string): {
  pointRelais: boolean;
  homeDelivery: boolean;
  country: CountryShippingConfig;
} {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) {
    throw new Error(`Pays non supporté: ${countryCode}`);
  }

  return {
    pointRelais: country.pointRelaisAvailable,
    homeDelivery: country.homeDeliveryAvailable,
    country
  };
}