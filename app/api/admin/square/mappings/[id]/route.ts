import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/admin/square/mappings/[id] - Mettre à jour un mapping
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, square_item_id, square_item_name } = body

    // Vérifier que le mapping existe
    const { data: existing, error: checkError } = await supabase
      .from('square_product_mapping')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Mapping non trouvé' }, { status: 404 })
    }

    // Construire l'objet de mise à jour
    const updateData: Record<string, any> = {}
    if (product_id !== undefined) updateData.product_id = product_id
    if (square_item_id !== undefined) updateData.square_catalog_id = square_item_id
    if (square_item_name !== undefined) updateData.square_product_name = square_item_name || null
    updateData.updated_at = new Date().toISOString()

    // Mettre à jour
    const { data: mapping, error: updateError } = await supabase
      .from('square_product_mapping')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating mapping:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(mapping)
  } catch (error) {
    console.error('Error in PUT /api/admin/square/mappings/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/square/mappings/[id] - Supprimer un mapping
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Vérifier l'authentification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que le mapping existe
    const { data: existing, error: checkError } = await supabase
      .from('square_product_mapping')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Mapping non trouvé' }, { status: 404 })
    }

    // Supprimer
    const { error: deleteError } = await supabase
      .from('square_product_mapping')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting mapping:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/square/mappings/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
