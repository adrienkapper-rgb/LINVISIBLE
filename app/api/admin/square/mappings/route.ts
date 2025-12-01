import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/square/mappings - Liste des mappings
export async function GET() {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les mappings avec les infos produits
    const { data: mappings, error } = await supabase
      .from('square_product_mapping')
      .select(`
        id,
        product_id,
        square_catalog_id,
        square_product_name,
        created_at,
        updated_at,
        products (
          id,
          name,
          slug,
          stock_quantity
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching mappings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transformer pour avoir product directement et adapter les noms de champs
    const result = mappings.map(m => ({
      id: m.id,
      product_id: m.product_id,
      square_item_id: m.square_catalog_id, // Alias pour compatibilité frontend
      square_item_name: m.square_product_name, // Alias pour compatibilité frontend
      sync_enabled: true, // Toujours actif (pas de colonne dans la DB)
      created_at: m.created_at,
      product: m.products
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/admin/square/mappings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/square/mappings - Créer un mapping
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, square_item_id, square_item_name } = body

    // Validation
    if (!product_id || !square_item_id) {
      return NextResponse.json({
        error: 'product_id et square_item_id sont requis'
      }, { status: 400 })
    }

    // Vérifier que le produit existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Vérifier qu'il n'y a pas déjà un mapping pour ce produit
    const { data: existing } = await supabase
      .from('square_product_mapping')
      .select('id')
      .eq('product_id', product_id)
      .single()

    if (existing) {
      return NextResponse.json({
        error: 'Ce produit a déjà un mapping Square'
      }, { status: 400 })
    }

    // Créer le mapping
    const { data: mapping, error: createError } = await supabase
      .from('square_product_mapping')
      .insert({
        product_id,
        square_catalog_id: square_item_id,
        square_product_name: square_item_name || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating mapping:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json(mapping, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/square/mappings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
