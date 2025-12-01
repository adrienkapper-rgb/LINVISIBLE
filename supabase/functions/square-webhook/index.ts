// Edge Function Supabase pour recevoir les webhooks Square
// URL: https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/square-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Vérifier signature Square avec Web Crypto API
async function verifySquareSignature(
  body: string,
  signature: string,
  webhookSignatureKey: string,
  webhookUrl: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSignatureKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(webhookUrl + body)
  )
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
  return signature === expectedSignature
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-square-hmacsha256-signature',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // GET pour vérifier que le webhook est accessible
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'Square webhook endpoint is active' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('x-square-hmacsha256-signature')

    // Vérifier la signature si configurée
    const webhookSignatureKey = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY')
    if (webhookSignatureKey && signature) {
      const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/square-webhook`
      const isValid = await verifySquareSignature(body, signature, webhookSignatureKey, webhookUrl)
      if (!isValid) {
        console.error('Invalid Square webhook signature')
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const event = JSON.parse(body)
    console.log('Square webhook received:', event.type)

    // Traiter uniquement les paiements complétés
    if (event.type !== 'payment.completed') {
      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payment = event.data?.object?.payment
    if (!payment) {
      console.error('No payment data in webhook')
      return new Response(
        JSON.stringify({ error: 'No payment data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les détails de la commande
    const orderId = payment.order_id
    if (!orderId) {
      console.log('Payment without order_id, skipping item details')
    }

    // Extraire les items depuis le payment si disponibles
    const lineItems = payment.order?.line_items || []

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i]
      const squareItemId = item.catalog_object_id || item.variation_id || item.name
      const quantity = parseInt(item.quantity) || 1
      const unitPrice = item.base_price_money?.amount || 0
      const totalAmount = item.total_money?.amount || (unitPrice * quantity)

      // Générer un UID unique pour ce line item
      const lineItemUid = item.uid || `${payment.id}_${squareItemId}_${i}`

      // Chercher le mapping pour cet item
      const { data: mapping } = await supabase
        .from('square_product_mapping')
        .select('product_id')
        .eq('square_catalog_id', squareItemId)
        .single()

      // Déterminer si on peut traiter automatiquement (produit mappé)
      const canAutoProcess = !!mapping?.product_id

      // Enregistrer la transaction
      const { error: insertError } = await supabase
        .from('square_transactions')
        .insert({
          square_transaction_id: payment.id,
          square_order_id: orderId,
          square_catalog_id: squareItemId,
          line_item_uid: lineItemUid,
          product_id: mapping?.product_id || null,
          quantity,
          amount_cents: totalAmount,
          transaction_date: payment.created_at || new Date().toISOString(),
          processed: canAutoProcess // Marquer comme traité si mappé
        })

      if (insertError) {
        console.error('Error inserting square transaction:', insertError)
      } else {
        console.log(`Transaction recorded: ${payment.id}, uid=${lineItemUid}, product: ${mapping?.product_id || 'unmapped'}, qty: ${quantity}`)

        // Si le produit est mappé, décrémenter le stock automatiquement
        if (canAutoProcess && mapping?.product_id) {
          // Décrémenter le stock via RPC
          const { error: rpcError } = await supabase.rpc('decrement_stock', {
            p_product_id: mapping.product_id,
            p_quantity: quantity
          })

          if (rpcError) {
            console.error('Error decrementing stock:', rpcError)
          } else {
            // Créer le mouvement de stock
            const { error: movementError } = await supabase
              .from('stock_movements')
              .insert({
                product_id: mapping.product_id,
                movement_type: 'square_sale',
                quantity: -quantity,
                notes: `Vente Square: ${payment.id}`
              })

            if (movementError) {
              console.error('Error creating stock movement:', movementError)
            } else {
              console.log(`✅ Stock auto-décrémenté: product ${mapping.product_id}, qty: -${quantity}`)
            }
          }
        }
      }
    }

    // Si pas de line items mais un paiement valide, enregistrer quand même
    if (lineItems.length === 0) {
      const { error: insertError } = await supabase
        .from('square_transactions')
        .insert({
          square_transaction_id: payment.id,
          square_order_id: orderId,
          square_catalog_id: null,
          line_item_uid: `${payment.id}_noitems`,
          product_id: null,
          quantity: 1,
          amount_cents: payment.amount_money?.amount || 0,
          transaction_date: payment.created_at || new Date().toISOString(),
          processed: false
        })

      if (insertError) {
        console.error('Error inserting square transaction:', insertError)
      } else {
        console.log(`Transaction recorded (no items): ${payment.id}`)
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing Square webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
