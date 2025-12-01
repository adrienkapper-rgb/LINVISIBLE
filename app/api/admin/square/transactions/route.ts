import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/square/transactions - Liste des transactions récentes
export async function GET() {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les transactions des 7 derniers jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: transactions, error } = await supabase
      .from('square_transactions')
      .select(`
        id,
        square_transaction_id,
        square_order_id,
        product_id,
        quantity,
        amount_cents,
        transaction_date,
        location_name,
        processed,
        synced_at,
        products (
          id,
          name,
          slug
        )
      `)
      .gte('transaction_date', sevenDaysAgo.toISOString())
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transformer pour avoir product directement et adapter les noms de champs
    const result = transactions.map(t => ({
      id: t.id,
      square_transaction_id: t.square_transaction_id,
      square_order_id: t.square_order_id,
      product_id: t.product_id,
      quantity: t.quantity,
      total_amount: t.amount_cents, // Alias pour compatibilité frontend
      transaction_date: t.transaction_date,
      location_name: t.location_name,
      synced: t.processed, // Alias pour compatibilité frontend
      created_at: t.synced_at,
      product: t.products
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/admin/square/transactions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
