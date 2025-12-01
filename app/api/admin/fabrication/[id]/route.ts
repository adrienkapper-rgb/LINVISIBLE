import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/fabrication/[id] - Détail d'une session
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la session avec les items et les infos produits
    const { data: session, error: sessionError } = await supabase
      .from('production_sessions')
      .select(`
        id,
        session_date,
        notes,
        created_at,
        created_by,
        production_items (
          id,
          product_id,
          quantity_produced,
          quantity_for_sale,
          quantity_internal,
          products (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', id)
      .single()

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
      }
      console.error('Error fetching session:', sessionError)
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Récupérer les infos du créateur si disponible
    let creator = null
    if (session.created_by) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', session.created_by)
        .single()

      creator = profile
    }

    // Transformer les données pour un format plus pratique
    const result = {
      id: session.id,
      session_date: session.session_date,
      notes: session.notes,
      created_at: session.created_at,
      created_by: session.created_by,
      creator,
      items: session.production_items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity_produced: item.quantity_produced,
        quantity_for_sale: item.quantity_for_sale,
        quantity_internal: item.quantity_internal,
        product: item.products
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/admin/fabrication/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/fabrication/[id] - Supprimer une session
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que la session existe
    const { data: session, error: checkError } = await supabase
      .from('production_sessions')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Supprimer la session (CASCADE supprimera les items, et les triggers géreront le stock)
    const { error: deleteError } = await supabase
      .from('production_sessions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting session:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/fabrication/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
