// Edge Function pour synchroniser le catalogue Square
// Récupère les Variation IDs associés aux Item IDs configurés
// URL: https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/square-sync-catalog

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SquareCatalogItem {
  id: string
  type: string
  item_data?: {
    name: string
    variations?: Array<{
      id: string
      item_variation_data?: {
        name: string
        item_id: string
      }
    }>
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer le token Square
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN')
    if (!squareAccessToken) {
      return new Response(
        JSON.stringify({ error: 'SQUARE_ACCESS_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les mappings existants
    const { data: mappings, error: mappingsError } = await supabase
      .from('square_product_mapping')
      .select('id, product_id, square_catalog_id, square_variation_id')

    if (mappingsError) {
      return new Response(
        JSON.stringify({ error: mappingsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${mappings?.length || 0} mappings to sync`)

    // Récupérer le catalogue Square
    let allItems: SquareCatalogItem[] = []
    let cursor: string | undefined

    do {
      const url = cursor
        ? `https://connect.squareup.com/v2/catalog/list?types=ITEM&cursor=${cursor}`
        : 'https://connect.squareup.com/v2/catalog/list?types=ITEM'

      const catalogResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${squareAccessToken}`,
          'Square-Version': '2024-01-18',
          'Content-Type': 'application/json'
        }
      })

      if (!catalogResponse.ok) {
        const errorText = await catalogResponse.text()
        console.error('Square Catalog API error:', errorText)
        return new Response(
          JSON.stringify({ error: 'Square Catalog API error', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const catalogData = await catalogResponse.json()
      const items = catalogData.objects as SquareCatalogItem[] || []
      allItems = allItems.concat(items)
      cursor = catalogData.cursor

      console.log(`Fetched ${items.length} items, total: ${allItems.length}`)
    } while (cursor)

    console.log(`Total catalog items: ${allItems.length}`)

    // Créer un map des Item IDs vers leurs Variation IDs
    const itemToVariations: Record<string, { variationId: string; variationName: string; itemName: string }[]> = {}

    for (const item of allItems) {
      if (item.type === 'ITEM' && item.item_data?.variations) {
        const variations = item.item_data.variations.map(v => ({
          variationId: v.id,
          variationName: v.item_variation_data?.name || 'Default',
          itemName: item.item_data?.name || 'Unknown'
        }))
        itemToVariations[item.id] = variations
      }
    }

    // Mettre à jour les mappings avec les variation IDs
    let updatedCount = 0
    let notFoundCount = 0
    const details: Array<{ mapping_id: string; item_id: string; variation_id: string | null; item_name: string }> = []

    for (const mapping of mappings || []) {
      const variations = itemToVariations[mapping.square_catalog_id]

      if (variations && variations.length > 0) {
        // Prendre la première variation (généralement "Regular" ou la seule)
        const primaryVariation = variations[0]

        // Mettre à jour le mapping avec le variation ID
        const { error: updateError } = await supabase
          .from('square_product_mapping')
          .update({
            square_variation_id: primaryVariation.variationId,
            square_product_name: primaryVariation.itemName
          })
          .eq('id', mapping.id)

        if (!updateError) {
          updatedCount++
          details.push({
            mapping_id: mapping.id,
            item_id: mapping.square_catalog_id,
            variation_id: primaryVariation.variationId,
            item_name: primaryVariation.itemName
          })
          console.log(`Updated mapping ${mapping.id}: ${primaryVariation.itemName} -> ${primaryVariation.variationId}`)
        }
      } else {
        notFoundCount++
        details.push({
          mapping_id: mapping.id,
          item_id: mapping.square_catalog_id,
          variation_id: null,
          item_name: 'NOT FOUND IN CATALOG'
        })
        console.log(`Item ${mapping.square_catalog_id} not found in Square catalog`)
      }
    }

    // Mettre également à jour les anciennes transactions pour utiliser variation_id comme clé
    // Maintenant on doit matcher par square_variation_id au lieu de square_catalog_id
    const { error: updateTransactionsError } = await supabase.rpc('match_transactions_by_variation', {})

    return new Response(
      JSON.stringify({
        success: true,
        total_mappings: mappings?.length || 0,
        updated: updatedCount,
        not_found: notFoundCount,
        catalog_items: allItems.length,
        details
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Sync failed', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
