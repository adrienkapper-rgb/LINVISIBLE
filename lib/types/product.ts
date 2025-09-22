import { Database } from '@/lib/supabase/types'

// Type de base depuis Supabase
export type ProductRow = Database['public']['Tables']['products']['Row']

// Type pour l'affichage des produits avec image préprocessée
export interface ProductDisplay {
  id: string
  slug: string
  name: string
  price: number
  volume: string
  alcohol: number
  image: string // URL d'image préprocessée
  description: string | null
  ingredients: string[]
  serving_instructions: string | null
  serving_size: string | null
  available: boolean
  weight: number
  numero: number
  stock_quantity: number
  created_at: string
  updated_at: string
}

// Type pour les cartes produit (version simplifiée)
export interface ProductCardData {
  id: string
  slug: string
  name: string
  price: number
  volume: string
  alcohol: number
  image: string
  description: string | null
  ingredients: string[]
  serving_instructions: string | null
  serving_size: string | null
  available: boolean
  weight: number
  numero: number
}

// Type pour les détails produit (version complète)
export interface ProductDetailsData extends ProductCardData {
  stock_quantity: number
  created_at: string
  updated_at: string
}