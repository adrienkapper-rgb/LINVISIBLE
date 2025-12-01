import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/products/[id]/movements - Historique des mouvements + stats
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: productId } = await params
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que le produit existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Récupérer les mouvements
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (movementsError) {
      console.error('Error fetching movements:', movementsError)
      return NextResponse.json({ error: movementsError.message }, { status: 500 })
    }

    // Calculer les stats
    const stats = {
      total_produced: 0,
      total_sold_web: 0,
      total_sold_square: 0,
      total_tasting_used: 0,
      total_adjustments: 0,
      total_losses: 0
    }

    for (const movement of movements || []) {
      switch (movement.movement_type) {
        case 'production_sale':
        case 'production_internal':
          stats.total_produced += movement.quantity
          break
        case 'web_sale':
          stats.total_sold_web += Math.abs(movement.quantity)
          break
        case 'square_sale':
          stats.total_sold_square += Math.abs(movement.quantity)
          break
        case 'tasting_used':
          stats.total_tasting_used += Math.abs(movement.quantity)
          break
        case 'adjustment':
          stats.total_adjustments += movement.quantity
          break
        case 'loss':
          stats.total_losses += Math.abs(movement.quantity)
          break
      }
    }

    return NextResponse.json({
      movements: movements || [],
      stats
    })
  } catch (error) {
    console.error('Error in GET /api/admin/products/[id]/movements:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
