"use client";

import { createClient } from '@/lib/supabase/client'
import { mapProductRowToCardData } from '@/lib/utils/product'
import { ProductCardData } from '@/lib/types/product'

// Client-side function to fetch products by IDs (for cart)
export async function getProductsByIds(productIds: string[]): Promise<ProductCardData[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, price, volume, alcohol, image_url, description, ingredients, serving_instructions, serving_size, available, weight, numero')
    .in('id', productIds)

  if (error) {
    console.error('Error fetching products by IDs:', error)
    return []
  }

  return (data || []).map(mapProductRowToCardData)
}
