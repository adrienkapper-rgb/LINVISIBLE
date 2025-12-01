import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/fabrication - Liste des sessions avec agrégats
export async function GET() {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les sessions avec les items agrégés
    const { data: sessions, error: sessionsError } = await supabase
      .from('production_sessions')
      .select(`
        id,
        session_date,
        notes,
        created_at,
        created_by,
        production_items (
          quantity_produced,
          quantity_for_sale,
          quantity_internal
        )
      `)
      .order('session_date', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json({ error: sessionsError.message }, { status: 500 })
    }

    // Transformer les données pour inclure les agrégats
    const sessionsWithStats = sessions.map(session => ({
      id: session.id,
      session_date: session.session_date,
      notes: session.notes,
      created_at: session.created_at,
      created_by: session.created_by,
      total_products: session.production_items?.length || 0,
      total_produced: session.production_items?.reduce((sum, item) => sum + item.quantity_produced, 0) || 0,
      total_for_sale: session.production_items?.reduce((sum, item) => sum + item.quantity_for_sale, 0) || 0,
      total_internal: session.production_items?.reduce((sum, item) => sum + item.quantity_internal, 0) || 0
    }))

    return NextResponse.json(sessionsWithStats)
  } catch (error) {
    console.error('Error in GET /api/admin/fabrication:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/fabrication - Créer une nouvelle session
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { session_date, notes, items } = body

    // Validation
    if (!session_date) {
      return NextResponse.json({ error: 'La date est requise' }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Au moins un produit est requis' }, { status: 400 })
    }

    // Valider chaque item
    for (const item of items) {
      if (!item.product_id || item.quantity_produced <= 0) {
        return NextResponse.json({
          error: 'Chaque item doit avoir un product_id et une quantité produite > 0'
        }, { status: 400 })
      }

      if (item.quantity_for_sale + item.quantity_internal !== item.quantity_produced) {
        return NextResponse.json({
          error: 'La somme vente + dégustation doit égaler le total produit'
        }, { status: 400 })
      }
    }

    // Créer la session
    const { data: session, error: sessionError } = await supabase
      .from('production_sessions')
      .insert({
        session_date,
        notes,
        created_by: user.id
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Créer les items (les triggers s'occuperont des stock_movements et de la mise à jour du stock)
    const productionItems = items.map(item => ({
      session_id: session.id,
      product_id: item.product_id,
      quantity_produced: item.quantity_produced,
      quantity_for_sale: item.quantity_for_sale,
      quantity_internal: item.quantity_internal
    }))

    const { error: itemsError } = await supabase
      .from('production_items')
      .insert(productionItems)

    if (itemsError) {
      console.error('Error creating items:', itemsError)
      // Supprimer la session si l'insertion des items échoue
      await supabase.from('production_sessions').delete().eq('id', session.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/fabrication:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
