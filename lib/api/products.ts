import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

export type Product = Database['public']['Tables']['products']['Row']

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  
  return data
}

export async function trackProductEvent(
  productId: string,
  eventType: 'view' | 'add_to_cart' | 'purchase',
  quantity: number = 1,
  sessionId?: string
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_analytics')
    .insert({
      product_id: productId,
      event_type: eventType,
      quantity,
      session_id: sessionId
    })
  
  if (error) {
    console.error('Error tracking product event:', error)
  }
}

export function getProductImageUrl(imageName: string | null): string {
  if (!imageName) return '/products/placeholder.jpg'
  
  // If it's already a full URL (Supabase storage), return as-is
  if (imageName.startsWith('https://')) {
    return imageName
  }
  
  // Otherwise, use local images
  return `/products/${imageName}`
}