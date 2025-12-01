import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Utiliser le client admin pour les webhooks (pas d'auth user)
// Initialisation paresseuse pour éviter les erreurs au build
let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}

// Vérifier la signature Square (optionnel mais recommandé)
function verifySquareSignature(
  body: string,
  signature: string,
  webhookSignatureKey: string,
  webhookUrl: string
): boolean {
  const stringToSign = webhookUrl + body
  const expectedSignature = crypto
    .createHmac('sha256', webhookSignatureKey)
    .update(stringToSign)
    .digest('base64')

  return signature === expectedSignature
}

// POST /api/webhooks/square - Recevoir les événements Square
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-square-hmacsha256-signature')

    // Vérifier la signature si configurée
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
    if (webhookSignatureKey && signature) {
      const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/square`
      if (!verifySquareSignature(body, signature, webhookSignatureKey, webhookUrl)) {
        console.error('Invalid Square webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log('Square webhook received:', event.type)

    // Traiter uniquement les paiements complétés
    if (event.type !== 'payment.completed') {
      return NextResponse.json({ received: true })
    }

    const payment = event.data?.object?.payment
    if (!payment) {
      console.error('No payment data in webhook')
      return NextResponse.json({ error: 'No payment data' }, { status: 400 })
    }

    // Récupérer les détails de la commande associée
    const orderId = payment.order_id
    if (!orderId) {
      console.log('Payment without order_id, skipping')
      return NextResponse.json({ received: true })
    }

    // Récupérer les line items de l'order via Square API
    // Note: Dans un cas réel, il faudrait appeler l'API Square pour obtenir les détails
    // Pour l'instant, on enregistre la transaction avec les infos disponibles

    // Extraire les items depuis le payment si disponibles
    const lineItems = payment.order?.line_items || []

    for (const item of lineItems) {
      const squareItemId = item.catalog_object_id || item.variation_id || item.name
      const quantity = parseInt(item.quantity) || 1
      const unitPrice = item.base_price_money?.amount || 0
      const totalAmount = item.total_money?.amount || (unitPrice * quantity)

      // Chercher le mapping pour cet item
      const { data: mapping } = await getSupabaseAdmin()
        .from('square_product_mapping')
        .select('product_id')
        .eq('square_catalog_id', squareItemId)
        .single()

      // Enregistrer la transaction
      const { error: insertError } = await getSupabaseAdmin()
        .from('square_transactions')
        .insert({
          square_transaction_id: payment.id,
          square_order_id: orderId,
          product_id: mapping?.product_id || null,
          quantity,
          amount_cents: totalAmount,
          transaction_date: payment.created_at || new Date().toISOString(),
          processed: false // Sera synchronisé lors de la réconciliation
        })

      if (insertError) {
        console.error('Error inserting square transaction:', insertError)
        // Continuer avec les autres items
      }
    }

    // Si pas de line items mais un paiement valide, enregistrer quand même
    if (lineItems.length === 0) {
      const { error: insertError } = await getSupabaseAdmin()
        .from('square_transactions')
        .insert({
          square_transaction_id: payment.id,
          square_order_id: orderId,
          product_id: null,
          quantity: 1,
          amount_cents: payment.amount_money?.amount || 0,
          transaction_date: payment.created_at || new Date().toISOString(),
          processed: false
        })

      if (insertError) {
        console.error('Error inserting square transaction:', insertError)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Square webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// GET pour vérifier que le webhook est accessible
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Square webhook endpoint is active'
  })
}
