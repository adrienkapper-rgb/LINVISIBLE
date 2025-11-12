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

// Grille tarifaire Point Relais France 2025 (Tarifs officiels TTC - HT × 1.20)
const FRANCE_POINT_RELAIS_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 250, price: 4.19 },      // 3.49€ HT
  { minWeight: 251, maxWeight: 500, price: 4.30 },    // 3.58€ HT
  { minWeight: 501, maxWeight: 1000, price: 5.39 },   // 4.49€ HT
  { minWeight: 1001, maxWeight: 2000, price: 6.59 },  // 5.49€ HT
  { minWeight: 2001, maxWeight: 3000, price: 7.40 },  // 6.17€ HT
  { minWeight: 3001, maxWeight: 4000, price: 8.90 },  // 7.42€ HT
  { minWeight: 4001, maxWeight: 5000, price: 12.40 }, // 10.33€ HT
  { minWeight: 5001, maxWeight: 7000, price: 14.40 }, // 12.00€ HT
  { minWeight: 7001, maxWeight: 10000, price: 14.40 }, // 12.00€ HT
  { minWeight: 10001, maxWeight: 15000, price: 22.40 }, // 18.67€ HT
  { minWeight: 15001, maxWeight: 20000, price: 22.40 }, // 18.67€ HT
  { minWeight: 20001, maxWeight: 25000, price: 32.40 }, // 27.00€ HT
  { minWeight: 25001, maxWeight: 30000, price: 32.40 }  // 27.00€ HT
];

// Grille tarifaire Livraison à Domicile France 2025 (Tarifs officiels TTC - HT × 1.20)
const FRANCE_HOME_DELIVERY_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 250, price: 4.99 },      // 4.16€ HT
  { minWeight: 251, maxWeight: 500, price: 6.79 },    // 5.66€ HT
  { minWeight: 501, maxWeight: 750, price: 8.56 },    // 7.13€ HT
  { minWeight: 751, maxWeight: 1000, price: 8.80 },   // 7.33€ HT
  { minWeight: 1001, maxWeight: 2000, price: 10.00 }, // 8.33€ HT
  { minWeight: 2001, maxWeight: 3000, price: 14.99 }, // 12.49€ HT
  { minWeight: 3001, maxWeight: 5000, price: 14.99 }, // 12.49€ HT
  { minWeight: 5001, maxWeight: 7000, price: 19.00 }, // 15.83€ HT
  { minWeight: 7001, maxWeight: 10000, price: 23.99 }, // 19.99€ HT
  { minWeight: 10001, maxWeight: 15000, price: 28.99 }, // 24.16€ HT
  { minWeight: 15001, maxWeight: 20000, price: 39.70 }, // 33.08€ HT
  { minWeight: 20001, maxWeight: 25000, price: 39.70 }  // 33.08€ HT
];

// Grille tarifaire Point Relais pour pays européens (Tarifs officiels TTC - HT × 1.20)
// Belgique, Espagne, Luxembourg, Pays-Bas
const EUROPE_POINT_RELAIS_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 250, price: 4.60 },      // 3.83€ HT
  { minWeight: 251, maxWeight: 500, price: 4.60 },    // 3.83€ HT
  { minWeight: 501, maxWeight: 1000, price: 5.90 },   // 4.92€ HT
  { minWeight: 1001, maxWeight: 2000, price: 8.20 },  // 6.83€ HT
  { minWeight: 2001, maxWeight: 3000, price: 8.20 },  // 6.83€ HT
  { minWeight: 3001, maxWeight: 4000, price: 9.70 },  // 8.08€ HT
  { minWeight: 4001, maxWeight: 5000, price: 12.90 }, // 10.75€ HT
  { minWeight: 5001, maxWeight: 7000, price: 14.40 }, // 12.00€ HT
  { minWeight: 7001, maxWeight: 10000, price: 14.40 }, // 12.00€ HT
  { minWeight: 10001, maxWeight: 15000, price: 26.40 }, // 22.00€ HT
  { minWeight: 15001, maxWeight: 20000, price: 26.40 }, // 22.00€ HT
  { minWeight: 20001, maxWeight: 25000, price: 36.40 }, // 30.33€ HT
  { minWeight: 25001, maxWeight: 30000, price: 36.40 }  // 30.33€ HT
];

// Grille tarifaire livraison à domicile pour pays européens (Tarifs officiels TTC - HT × 1.20)
// Belgique, Luxembourg, Pays-Bas, Allemagne
const EUROPE_HOME_DELIVERY_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 250, price: 12.07 },     // 10.06€ HT
  { minWeight: 251, maxWeight: 500, price: 12.07 },   // 10.06€ HT
  { minWeight: 501, maxWeight: 750, price: 12.07 },   // 10.06€ HT
  { minWeight: 751, maxWeight: 1000, price: 13.55 },  // 11.29€ HT
  { minWeight: 1001, maxWeight: 2000, price: 13.55 }, // 11.29€ HT
  { minWeight: 2001, maxWeight: 3000, price: 15.65 }, // 13.04€ HT
  { minWeight: 3001, maxWeight: 5000, price: 18.37 }, // 15.31€ HT
  { minWeight: 5001, maxWeight: 7000, price: 24.05 }, // 20.04€ HT
  { minWeight: 7001, maxWeight: 10000, price: 24.05 }, // 20.04€ HT
  { minWeight: 10001, maxWeight: 15000, price: 32.45 }, // 27.04€ HT
  { minWeight: 15001, maxWeight: 20000, price: 41.47 }, // 34.56€ HT
  { minWeight: 20001, maxWeight: 25000, price: 41.47 }, // 34.56€ HT
  { minWeight: 25001, maxWeight: 30000, price: 41.47 }  // 34.56€ HT
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
  // Calcul du nombre total de bouteilles
  const totalBottles = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  // Calcul du nombre de boîtes nécessaires (1 boîte pour 3 bouteilles max)
  const numberOfBoxes = Math.ceil(totalBottles / 3);

  // Poids des bouteilles : 1050g par bouteille
  const bottlesWeight = totalBottles * 1050;

  // Poids des boîtes : 200g par boîte
  const boxesWeight = numberOfBoxes * 200;

  return bottlesWeight + boxesWeight;
}

interface PackageInfo {
  weight: number;
  cost: number;
}

interface MultiPackageResult {
  packages: PackageInfo[];
  totalCost: number;
  totalWeight: number;
  packageCount: number;
}

function calculateMultiPackageShipping(
  totalWeightInGrams: number,
  countryCode: string = 'FR',
  preferPointRelais: boolean = true
): MultiPackageResult {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) {
    throw new Error(`Pays non supporté: ${countryCode}`);
  }

  // Le poids des boîtes est déjà inclus dans calculateTotalWeight()
  const packageWeight = totalWeightInGrams;

  // Déterminer le poids max selon le service
  let rates: ShippingRate[];
  if (preferPointRelais && country.pointRelaisAvailable && country.pointRelaisRates) {
    rates = country.pointRelaisRates;
  } else if (country.homeDeliveryAvailable && country.homeDeliveryRates) {
    rates = country.homeDeliveryRates;
  } else {
    throw new Error(`Aucun service de livraison disponible pour ${country.name}`);
  }

  // Obtenir le poids maximum pour ce service
  const maxPackageWeight = Math.max(...rates.map(r => r.maxWeight));

  // Si le poids est dans les limites, utiliser un seul colis
  if (packageWeight <= maxPackageWeight) {
    const cost = calculateSinglePackageCost(packageWeight, countryCode, preferPointRelais);
    return {
      packages: [{ weight: packageWeight, cost }],
      totalCost: cost,
      totalWeight: packageWeight,
      packageCount: 1
    };
  }

  // Pour la livraison à domicile, ne pas autoriser le multi-colis
  // (seul Point Relais supporte le multi-colis)
  if (!preferPointRelais) {
    const serviceType = 'Livraison à domicile';
    throw new Error(`Le poids du colis (${(packageWeight / 1000).toFixed(1)}kg) dépasse la limite pour ${serviceType} vers ${country.name} (max: ${(maxPackageWeight / 1000)}kg)`);
  }

  // Diviser en plusieurs colis (uniquement pour Point Relais)
  const packages: PackageInfo[] = [];
  let remainingWeight = packageWeight;

  while (remainingWeight > 0) {
    const currentPackageWeight = Math.min(remainingWeight, maxPackageWeight);
    const cost = calculateSinglePackageCost(currentPackageWeight, countryCode, preferPointRelais);

    packages.push({
      weight: currentPackageWeight,
      cost
    });

    remainingWeight -= currentPackageWeight;
  }

  return {
    packages,
    totalCost: packages.reduce((sum, pkg) => sum + pkg.cost, 0),
    totalWeight: packageWeight,
    packageCount: packages.length
  };
}

function calculateSinglePackageCost(
  packageWeightInGrams: number, 
  countryCode: string = 'FR', 
  preferPointRelais: boolean = true
): number {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) {
    throw new Error(`Pays non supporté: ${countryCode}`);
  }
  
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
    packageWeightInGrams >= rate.minWeight && packageWeightInGrams <= rate.maxWeight
  );

  if (!rate) {
    // Vérifier si le poids dépasse la limite maximale
    const maxWeight = Math.max(...rates.map(r => r.maxWeight));
    if (packageWeightInGrams > maxWeight) {
      const serviceType = preferPointRelais ? 'Point Relais' : 'Livraison à domicile';
      throw new Error(`Le poids du colis (${(packageWeightInGrams / 1000).toFixed(1)}kg) dépasse la limite pour ${serviceType} vers ${country.name} (max: ${(maxWeight / 1000)}kg)`);
    }
    // Pour les poids très légers non couverts, utiliser le premier tarif
    return rates[0].price;
  }

  return rate.price;
}

export function calculateShippingCost(
  totalWeightInGrams: number, 
  countryCode: string = 'FR', 
  preferPointRelais: boolean = true
): number {
  const result = calculateMultiPackageShipping(totalWeightInGrams, countryCode, preferPointRelais);
  return result.totalCost;
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
  packages: PackageInfo[];
  packageCount: number;
  packageDetails: string;
} {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) {
    throw new Error(`Pays non supporté: ${countryCode}`);
  }

  const multiPackageResult = calculateMultiPackageShipping(totalWeightInGrams, countryCode, preferPointRelais);
  
  // Déterminer le service utilisé
  const service = (preferPointRelais && country.pointRelaisAvailable) ? 'point-relais' : 'domicile';
  
  // Créer une description détaillée des colis
  const packageDetails = multiPackageResult.packageCount > 1 
    ? `${multiPackageResult.packageCount} colis (${multiPackageResult.packages.map(pkg => 
        `${(pkg.weight / 1000).toFixed(1)}kg`
      ).join(' + ')})`
    : `1 colis (${(multiPackageResult.totalWeight / 1000).toFixed(1)}kg)`;
  
  return {
    weight: multiPackageResult.totalWeight,
    cost: multiPackageResult.totalCost,
    formattedWeight: multiPackageResult.totalWeight >= 1000 
      ? `${(multiPackageResult.totalWeight / 1000).toFixed(1)} kg`
      : `${multiPackageResult.totalWeight} g`,
    service,
    deliveryTime: country.deliveryTime,
    country,
    packages: multiPackageResult.packages,
    packageCount: multiPackageResult.packageCount,
    packageDetails
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
  
  if (packageWeight <= 0) {
    return {
      isValid: false,
      error: 'Le poids du colis doit être supérieur à 0'
    };
  }
  
  // Plus de limite de poids maximum - on divise automatiquement en plusieurs colis
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