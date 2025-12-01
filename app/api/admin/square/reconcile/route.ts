import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/admin/square/reconcile - Réconcilier les transactions Square
export async function POST() {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Étape 1: Matcher les transactions non mappées via square_catalog_id
    const { data: unmappedTransactions } = await supabase
      .from('square_transactions')
      .select('id, square_catalog_id')
      .eq('processed', false)
      .is('product_id', null)
      .not('square_catalog_id', 'is', null)

    let matchedCount = 0
    if (unmappedTransactions && unmappedTransactions.length > 0) {
      for (const tx of unmappedTransactions) {
        // Chercher le mapping pour ce catalog_id
        const { data: mapping } = await supabase
          .from('square_product_mapping')
          .select('product_id')
          .eq('square_catalog_id', tx.square_catalog_id)
          .single()

        if (mapping?.product_id) {
          // Mettre à jour la transaction avec le product_id trouvé
          await supabase
            .from('square_transactions')
            .update({ product_id: mapping.product_id })
            .eq('id', tx.id)
          matchedCount++
        }
      }
    }

    // Étape 2: Récupérer les transactions non synchronisées avec un product_id
    const { data: transactions, error: fetchError } = await supabase
      .from('square_transactions')
      .select(`
        id,
        product_id,
        quantity,
        square_transaction_id
      `)
      .eq('processed', false)
      .not('product_id', 'is', null)

    if (fetchError) {
      console.error('Error fetching transactions:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        success: true,
        synced_count: 0,
        matched_count: matchedCount,
        message: matchedCount > 0
          ? `${matchedCount} transactions matchées, mais aucune à synchroniser (déjà traitées ou sans mapping)`
          : 'Aucune transaction à synchroniser'
      })
    }

    let syncedCount = 0
    const errors: string[] = []

    for (const transaction of transactions) {
      try {
        // Récupérer le stock actuel du produit
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, stock_quantity')
          .eq('id', transaction.product_id)
          .single()

        if (productError || !product) {
          errors.push(`Produit ${transaction.product_id} non trouvé`)
          continue
        }

        // Calculer le nouveau stock
        const newStock = Math.max(0, product.stock_quantity - transaction.quantity)

        // Mettre à jour le stock du produit
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', transaction.product_id)

        if (updateError) {
          errors.push(`Erreur MAJ stock produit ${transaction.product_id}: ${updateError.message}`)
          continue
        }

        // Créer un mouvement de stock
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: transaction.product_id,
            movement_type: 'square_sale',
            quantity: -transaction.quantity,
            notes: `Vente Square: ${transaction.square_transaction_id}`,
            created_by: user.id
          })

        if (movementError) {
          console.error('Error creating movement:', movementError)
          // Continue anyway, the stock update was successful
        }

        // Marquer la transaction comme synchronisée
        const { error: syncError } = await supabase
          .from('square_transactions')
          .update({ processed: true })
          .eq('id', transaction.id)

        if (syncError) {
          errors.push(`Erreur sync transaction ${transaction.id}: ${syncError.message}`)
          continue
        }

        syncedCount++
      } catch (err: any) {
        errors.push(`Erreur transaction ${transaction.id}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      synced_count: syncedCount,
      matched_count: matchedCount,
      total_transactions: transactions.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in POST /api/admin/square/reconcile:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
