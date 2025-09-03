// Configuration des formats de codes postaux par pays européens

export interface PostalCodeConfig {
  pattern: string; // Regex pattern
  placeholder: string;
  maxLength: number;
  description: string;
  example: string;
}

export const POSTAL_CODE_FORMATS: Record<string, PostalCodeConfig> = {
  FR: {
    pattern: '^[0-9]{5}$',
    placeholder: '75001',
    maxLength: 5,
    description: '5 chiffres',
    example: '75001'
  },
  BE: {
    pattern: '^[0-9]{4}$',
    placeholder: '1000',
    maxLength: 4,
    description: '4 chiffres',
    example: '1000'
  },
  ES: {
    pattern: '^[0-9]{5}$',
    placeholder: '28001',
    maxLength: 5,
    description: '5 chiffres',
    example: '28001'
  },
  LU: {
    pattern: '^[0-9]{4}$',
    placeholder: '1234',
    maxLength: 4,
    description: '4 chiffres',
    example: '1234'
  },
  NL: {
    pattern: '^[0-9]{4}\\s[A-Z]{2}$',
    placeholder: '1234 AB',
    maxLength: 7,
    description: '4 chiffres + espace + 2 lettres',
    example: '1234 AB'
  }
};

/**
 * Valide un code postal selon le format du pays
 */
export function validatePostalCode(code: string, countryCode: string): boolean {
  const format = POSTAL_CODE_FORMATS[countryCode];
  if (!format) return true; // Pas de validation si format inconnu
  return new RegExp(format.pattern).test(code.trim());
}

/**
 * Formate automatiquement l'input du code postal selon le pays
 */
export function formatPostalCodeInput(input: string, countryCode: string): string {
  const cleaned = input.replace(/[^0-9A-Za-z]/g, ''); // Supprimer caractères non autorisés
  
  switch (countryCode) {
    case 'NL':
      // Pour les Pays-Bas, auto-formater avec l'espace après 4 chiffres
      if (cleaned.length >= 5) {
        const numbers = cleaned.slice(0, 4);
        const letters = cleaned.slice(4, 6).toUpperCase();
        return numbers + ' ' + letters;
      }
      return cleaned;
    
    case 'FR':
    case 'ES':
      // Limiter à 5 chiffres pour France et Espagne
      return cleaned.slice(0, 5);
    
    case 'BE':
    case 'LU':
      // Limiter à 4 chiffres pour Belgique et Luxembourg
      return cleaned.slice(0, 4);
    
    default:
      return cleaned;
  }
}

/**
 * Obtient la configuration du format postal pour un pays
 */
export function getPostalFormat(countryCode: string): PostalCodeConfig | null {
  return POSTAL_CODE_FORMATS[countryCode] || null;
}