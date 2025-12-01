import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/products/[id]/adjustment - Ajustement manuel du stock
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
    const { stock_type, new_quantity, reason } = body

    // Validation
    if (!stock_type || !['stock_quantity', 'stock_internal'].includes(stock_type)) {
      return NextResponse.json({ error: 'Type de stock invalide' }, { status: 400 })
    }

    if (typeof new_quantity !== 'number' || new_quantity < 0) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'La raison est requise' }, { status: 400 })
    }

    // Récupérer le produit actuel
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, stock_internal')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Calculer la différence
    const currentQuantity = stock_type === 'stock_quantity'
      ? product.stock_quantity
      : product.stock_internal
    const quantityDiff = new_quantity - currentQuantity

    // Si pas de changement, retourner succès
    if (quantityDiff === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun changement nécessaire',
        product
      })
    }

    // Mettre à jour le stock
    const updateData = stock_type === 'stock_quantity'
      ? { stock_quantity: new_quantity }
      : { stock_internal: new_quantity }

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating product:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Créer le mouvement de stock
    const movementType = quantityDiff < 0 ? 'loss' : 'adjustment'
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: productId,
        movement_type: movementType,
        quantity: quantityDiff,
        notes: `${stock_type === 'stock_quantity' ? 'Stock vente' : 'Stock dégustation'}: ${reason}`,
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
      adjustment: {
        stock_type,
        previous_quantity: currentQuantity,
        new_quantity,
        difference: quantityDiff
      }
    })
  } catch (error) {
    console.error('Error in POST /api/admin/products/[id]/adjustment:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
