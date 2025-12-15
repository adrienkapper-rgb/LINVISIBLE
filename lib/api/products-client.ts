"use client";

import { createClient } from '@/lib/supabase/client'
import { mapProductRowToCardData } from '@/lib/utils/product'
import { ProductCardData } from '@/lib/types/product'

// Client-side function to fetch products by IDs (for cart)
export async function getProductsByIds(productIds: string[]): Promise<ProductCardData[]> {
  // Filter out any invalid IDs and ensure we have valid UUIDs
  const validIds = productIds.filter(id =>
    id && typeof id === 'string' && id.length > 0
  )

  if (validIds.length === 0) {
    return []
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, price, volume, alcohol, image_url, description, ingredients, serving_instructions, serving_size, available, weight, numero')
    .in('id', validIds)

  if (error) {
    console.error('Error fetching products by IDs:', error.message || error)
    return []
  }

  return (data || []).map(mapProductRowToCardData)
}
