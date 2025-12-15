import { ProductRow, ProductDisplay, ProductCardData } from '@/lib/types/product'

/**
 * Formate le nom d'un produit avec son numéro
 */
export function formatProductName(numero: number, name: string): string {
  return `N°${numero} - ${name}`
}

/**
 * Génère le titre complet d'un produit pour les métadonnées
 */
export function getProductTitle(numero: number, name: string, suffix: string = 'Cocktail Artisanal'): string {
  return `${formatProductName(numero, name)} - ${suffix}`
}

/**
 * Génère la description d'un produit pour les métadonnées
 */
export function getProductDescription(
  numero: number,
  name: string,
  description: string | null,
  price: number
): string {
  const productName = formatProductName(numero, name)
  return `Découvrez ${productName}, cocktail artisanal de L'invisible à Bordeaux. ${description} Prix: ${price}€. Commandez en ligne.`
}

/**
 * Génère l'alt text d'une image produit
 */
export function getProductImageAlt(numero: number, name: string): string {
  return `${formatProductName(numero, name)} - Cocktail artisanal L'invisible`
}

/**
 * Génère l'URL d'une image produit
 */
export function getProductImageUrl(imageName: string | null): string {
  if (!imageName) return '/products/placeholder.jpg'

  // If it's already a full URL (Supabase storage), return as-is
  if (imageName.startsWith('https://')) {
    return imageName
  }

  // Otherwise, use local images
  return `/products/${imageName}`
}

/**
 * Convertit une row Supabase en ProductDisplay avec image préprocessée
 */
export function mapProductRowToDisplay(product: ProductRow): ProductDisplay {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    volume: product.volume,
    alcohol: product.alcohol,
    image: getProductImageUrl(product.image_url),
    description: product.description || null,
    ingredients: product.ingredients || [],
    serving_instructions: product.serving_instructions,
    serving_size: product.serving_size,
    available: product.available ?? true,
    weight: product.weight,
    numero: product.numero,
    stock_quantity: product.stock_quantity || 0,
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString()
  }
}

/**
 * Convertit une row Supabase en ProductCardData avec image préprocessée
 */
export function mapProductRowToCardData(product: ProductRow): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    volume: product.volume,
    alcohol: product.alcohol,
    image: getProductImageUrl(product.image_url),
    description: product.description || null,
    ingredients: product.ingredients || [],
    serving_instructions: product.serving_instructions,
    serving_size: product.serving_size,
    available: product.available ?? true,
    weight: product.weight,
    numero: product.numero
  }
}