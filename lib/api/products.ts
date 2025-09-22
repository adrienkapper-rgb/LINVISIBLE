import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'
import { mapProductRowToDisplay } from '@/lib/utils/product'
import { cache } from 'react'

export type Product = Database['public']['Tables']['products']['Row']

// React cache for products - revalidates per request
export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, price, volume, alcohol, image_url, description, ingredients, serving_instructions, serving_size, available, weight, numero, stock_quantity, created_at, updated_at')
    .eq('available', true)
    .order('numero')
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data || []
})

// React cache for single product - revalidates per request
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, price, volume, alcohol, image_url, description, ingredients, serving_instructions, serving_size, available, weight, numero, stock_quantity, created_at, updated_at')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  
  return data
})

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

// Re-export utility function for backward compatibility
export { getProductImageUrl } from '@/lib/utils/product'