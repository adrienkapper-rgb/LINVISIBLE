import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/products/[id]/use-tasting - Utiliser du stock dégustation
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: productId } = await params
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { quantity, notes } = body

    // Validation
    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })
    }

    // Récupérer le produit actuel
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_internal')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Vérifier qu'il y a assez de stock
    if (product.stock_internal < quantity) {
      return NextResponse.json({
        error: `Stock insuffisant. Disponible: ${product.stock_internal}`
      }, { status: 400 })
    }

    // Mettre à jour le stock dégustation
    const newQuantity = product.stock_internal - quantity
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ stock_internal: newQuantity })
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating product:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Créer le mouvement de stock
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: productId,
        movement_type: 'tasting_used',
        quantity: -quantity, // Négatif car c'est une sortie
        notes: notes || 'Utilisation dégustation',
        created_by: user.id
      })

    if (movementError) {
      console.error('Error creating movement:', movementError)
      // Le stock est mis à jour mais le mouvement n'a pas été enregistré
      // On continue quand même mais on log l'erreur
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      usage: {
        quantity_used: quantity,
        previous_stock: product.stock_internal,
        new_stock: newQuantity
      }
    })
  } catch (error) {
    console.error('Error in POST /api/admin/products/[id]/use-tasting:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
