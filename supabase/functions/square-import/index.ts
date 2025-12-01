// Edge Function pour importer les ventes Square passées
// URL: https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/square-import

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SquarePayment {
  id: string
  order_id?: string
  amount_money?: { amount: number; currency: string }
  created_at: string
  status: string
}

interface SquareOrderLineItem {
  uid?: string // Identifiant unique du line item
  catalog_object_id?: string
  variation_name?: string
  name?: string
  quantity: string
  total_money?: { amount: number }
  base_price_money?: { amount: number }
}

interface SquareOrder {
  id: string
  line_items?: SquareOrderLineItem[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification (admin seulement)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'utilisateur est admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer le token Square depuis les secrets
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN')
    if (!squareAccessToken) {
      return new Response(
        JSON.stringify({ error: 'SQUARE_ACCESS_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Paramètres de la requête
    const url = new URL(req.url)
    const daysParam = url.searchParams.get('days') || '7'
    const days = parseInt(daysParam)

    // Calculer la date de début
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const beginTime = startDate.toISOString()

    console.log(`Importing Square payments from last ${days} days (since ${beginTime})`)

    // Appeler l'API Square pour lister les paiements
    const paymentsResponse = await fetch(
      `https://connect.squareup.com/v2/payments?begin_time=${encodeURIComponent(beginTime)}&sort_order=DESC`,
      {
        headers: {
          'Authorization': `Bearer ${squareAccessToken}`,
          'Square-Version': '2024-01-18',
          'Content-Type': 'application/json'
        }
      }
    )

    if (!paymentsResponse.ok) {
      const errorText = await paymentsResponse.text()
      console.error('Square API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Square API error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentsData = await paymentsResponse.json()
    const payments: SquarePayment[] = paymentsData.payments || []

    console.log(`Found ${payments.length} payments`)

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const payment of payments) {
      // Ne traiter que les paiements complétés
      if (payment.status !== 'COMPLETED') {
        skipped++
        continue
      }

      // Vérifier si la transaction existe déjà
      const { data: existing } = await supabase
        .from('square_transactions')
        .select('id')
        .eq('square_transaction_id', payment.id)
        .single()

      if (existing) {
        skipped++
        continue
      }

      // Si pas d'order_id, enregistrer le paiement simple
      if (!payment.order_id) {
        const { error: insertError } = await supabase
          .from('square_transactions')
          .insert({
            square_transaction_id: payment.id,
            square_order_id: null,
            line_item_uid: `${payment.id}_simple`,
            product_id: null,
            quantity: 1,
            amount_cents: payment.amount_money?.amount || 0,
            transaction_date: payment.created_at,
            processed: false
          })

        if (insertError) {
          console.error('Insert error:', insertError)
          errors++
        } else {
          imported++
        }
        continue
      }

      // Récupérer les détails de la commande
      const orderResponse = await fetch(
        `https://connect.squareup.com/v2/orders/${payment.order_id}`,
        {
          headers: {
            'Authorization': `Bearer ${squareAccessToken}`,
            'Square-Version': '2024-01-18',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!orderResponse.ok) {
        // Si on ne peut pas récupérer l'order, enregistrer le paiement simple
        const { error: insertError } = await supabase
          .from('square_transactions')
          .insert({
            square_transaction_id: payment.id,
            square_order_id: payment.order_id,
            line_item_uid: `${payment.id}_nofetch`,
            product_id: null,
            quantity: 1,
            amount_cents: payment.amount_money?.amount || 0,
            transaction_date: payment.created_at,
            processed: false
          })

        if (insertError) {
          errors++
        } else {
          imported++
        }
        continue
      }

      const orderData = await orderResponse.json()
      const order: SquareOrder = orderData.order

      const lineItems = order.line_items || []

      if (lineItems.length === 0) {
        // Pas de line items, enregistrer le paiement simple
        const { error: insertError } = await supabase
          .from('square_transactions')
          .insert({
            square_transaction_id: payment.id,
            square_order_id: payment.order_id,
            line_item_uid: `${payment.id}_noitems`,
            product_id: null,
            quantity: 1,
            amount_cents: payment.amount_money?.amount || 0,
            transaction_date: payment.created_at,
            processed: false
          })

        if (insertError) {
          errors++
        } else {
          imported++
        }
      } else {
        // Enregistrer chaque line item
        for (let i = 0; i < lineItems.length; i++) {
          const item = lineItems[i]
          const squareItemId = item.catalog_object_id || item.variation_name || item.name || 'UNKNOWN'
          const quantity = parseInt(item.quantity) || 1
          const totalAmount = item.total_money?.amount || item.base_price_money?.amount || 0

          // Générer un UID unique pour ce line item
          // Priorité: uid Square > fallback basé sur position
          const lineItemUid = item.uid || `${payment.id}_${squareItemId}_${i}`

          // Chercher le mapping
          const { data: mapping } = await supabase
            .from('square_product_mapping')
            .select('product_id')
            .eq('square_catalog_id', squareItemId)
            .single()

          const { error: insertError } = await supabase
            .from('square_transactions')
            .insert({
              square_transaction_id: payment.id,
              square_order_id: payment.order_id,
              square_catalog_id: squareItemId,
              line_item_uid: lineItemUid,
              product_id: mapping?.product_id || null,
              quantity,
              amount_cents: totalAmount,
              transaction_date: payment.created_at,
              processed: false
            })

          if (insertError) {
            console.error('Insert error:', insertError)
            errors++
          } else {
            console.log(`Imported: catalog_id=${squareItemId}, uid=${lineItemUid}, product_id=${mapping?.product_id || 'null'}, qty=${quantity}`)
            imported++
          }
        }
      }
    }

    const result = {
      success: true,
      total_payments: payments.length,
      imported,
      skipped,
      errors,
      period_days: days
    }

    console.log('Import result:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Import failed', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
