import { createClient } from './supabase/client'

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  volume: string;
  alcohol: number;
  image: string;
  description: string;
  ingredients: string[];
  servingInstructions: string;
  servingSize: string;
  available: boolean;
  stock_quantity?: number;
  weight: number; // Poids en grammes
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .order('created_at')
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data.map(product => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    volume: product.volume,
    alcohol: product.alcohol,
    image: product.image_url || `/products/${product.slug}.jpg`,
    description: product.description || '',
    ingredients: product.ingredients || [],
    servingInstructions: product.serving_instructions || '',
    servingSize: product.serving_size || '',
    available: product.available,
    stock_quantity: product.stock_quantity,
    weight: product.weight || 750
  }))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    price: data.price,
    volume: data.volume,
    alcohol: data.alcohol,
    image: data.image_url || `/products/${data.slug}.jpg`,
    description: data.description || '',
    ingredients: data.ingredients || [],
    servingInstructions: data.serving_instructions || '',
    servingSize: data.serving_size || '',
    available: data.available,
    stock_quantity: data.stock_quantity,
    weight: data.weight || 750
  }
}