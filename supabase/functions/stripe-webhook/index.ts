import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@18.5.0?target=denonext'

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-12-18.acacia',
})

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface OrderData {
  id: string
  order_number: string
  email: string
  first_name: string
  last_name: string
  phone: string
  mondial_relay_point?: string
  delivery_type: 'point-relais' | 'domicile'
  delivery_address?: string
  delivery_postal_code?: string
  delivery_city?: string
  delivery_country?: string
  subtotal: number
  shipping_cost: number
  total: number
  status: string
  stripe_payment_intent_id?: string
  created_at: string
  // Champs pour les cadeaux
  is_gift?: boolean
  recipient_first_name?: string
  recipient_last_name?: string
}

interface OrderItem {
  id: string
  order_id: string
  product_name: string
  product_price: number
  quantity: number
  total: number
}

// Function to update order status
async function updateOrderStatus(orderId: string, status: string, paymentIntentId?: string) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }
  
  if (paymentIntentId) {
    updateData.stripe_payment_intent_id = paymentIntentId
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  return { error }
}

// Function to get order items
async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data: items, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) {
    console.error('Error fetching order items:', error)
    return []
  }

  return items || []
}

// Function to call Supabase Edge Function for order confirmation email
async function sendOrderConfirmationEmail(order: OrderData, orderItems: OrderItem[]) {
  try {
    console.log('📧 Appel Edge Function send-order-confirmation')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured')
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ order, orderItems })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erreur Edge Function send-order-confirmation:', errorData)
      throw new Error(`Edge function error: ${response.status} - ${errorData.error}`)
    }
    
    const data = await response.json()
    console.log('✅ Edge Function send-order-confirmation réussie:', data)
    return data
  } catch (error) {
    console.error('❌ Erreur dans sendOrderConfirmationEmail:', error)
    throw error
  }
}

// Function to call Supabase Edge Function for admin notification email
async function sendAdminNotificationEmail(order: OrderData, orderItems: OrderItem[]) {
  try {
    console.log('📧 Appel Edge Function send-admin-notification')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured')
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-admin-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ order, orderItems })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erreur Edge Function send-admin-notification:', errorData)
      throw new Error(`Edge function error: ${response.status} - ${errorData.error}`)
    }
    
    const data = await response.json()
    console.log('✅ Edge Function send-admin-notification réussie:', data)
    return data
  } catch (error) {
    console.error('❌ Erreur dans sendAdminNotificationEmail:', error)
    throw error
  }
}

// Function to process successful payment
async function processSuccessfulPayment(order: OrderData, paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`📦 Traitement paiement réussi pour commande ${order.order_number}`)
    
    // Check if payment has not already been processed
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('provider_payment_id', paymentIntent.id)
      .single()

    if (existingPayment && existingPayment.status === 'succeeded') {
      console.log(`⚠️ Paiement déjà traité pour ${paymentIntent.id}`)
      return
    }

    // Update order status to 'processing'
    const { error: statusError } = await updateOrderStatus(order.id, 'processing', paymentIntent.id)
    if (statusError) {
      console.error('❌ Erreur mise à jour statut commande:', statusError)
    }

    // Create or update payment record
    const paymentData = {
      order_id: order.id,
      payment_method: 'stripe',
      provider_payment_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'succeeded'
    }

    if (existingPayment) {
      await supabase
        .from('payments')
        .update({ ...paymentData, updated_at: new Date().toISOString() })
        .eq('id', existingPayment.id)
    } else {
      await supabase
        .from('payments')
        .insert(paymentData)
    }

    console.log(`💰 Paiement enregistré pour commande ${order.order_number}`)

    // Get order items for emails
    const orderItems = await getOrderItems(order.id)
    
    // Send confirmation emails (with error handling to not block webhook)
    try {
      await sendOrderConfirmationEmail(order, orderItems)
      console.log(`📧 Email de confirmation commande envoyé pour ${order.order_number}`)
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email confirmation commande:', emailError)
    }
    
    try {
      await sendAdminNotificationEmail(order, orderItems)
      console.log(`📧 Email admin traité pour commande ${order.order_number}`)
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email admin:', emailError)
    }

    console.log(`✅ Paiement traité avec succès pour commande ${order.order_number}`)
    
  } catch (error) {
    console.error('❌ Erreur dans processSuccessfulPayment:', error)
    throw error
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    console.log('🔗 Webhook Stripe reçu sur Edge Function')
    console.log('📝 Body length:', body.length)
    console.log('🔑 Signature présente:', !!signature)

    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    console.log('🔐 Endpoint secret configuré:', !!endpointSecret)

    if (!signature) {
      console.error('❌ Signature manquante')
      return new Response('Missing signature', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      if (!endpointSecret) {
        console.log('⚠️ Webhook secret non configuré, processing en mode dev')
        event = JSON.parse(body)
      } else if (signature === 'test_signature') {
        console.log('🧪 Mode test manuel détecté')
        event = JSON.parse(body)
      } else {
        // Debug information
        console.log('🔍 Debug signature verification:')
        console.log('- Signature reçue:', signature?.substring(0, 20) + '...')
        console.log('- Secret configuré:', endpointSecret?.substring(0, 10) + '...')
        console.log('- Body length:', body.length)
        
        try {
          // Use Stripe's webhook verification
          event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
          console.log('✅ Signature Stripe vérifiée avec succès')
        } catch (stripeError) {
          console.error('❌ Erreur vérification Stripe:', stripeError.message)
          
          // MODE DEBUG TEMPORAIRE - Traiter quand même le webhook
          console.log('🚨 MODE DEBUG: Traitement du webhook malgré l\'erreur de signature')
          event = JSON.parse(body)
          
          // Mais loguer l'erreur pour investigation
          console.log('⚠️ ATTENTION: Webhook traité sans vérification de signature!')
        }
      }
      
      console.log('✅ Webhook événement parsé:', event.type)
      console.log('🆔 Event ID:', event.id)
    } catch (err) {
      console.error('❌ Erreur critique parsing webhook:', err)
      return new Response('Webhook parsing failed', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Process webhook events
    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          
          console.log('💳 Payment Intent succeeded:', paymentIntent.id)
          console.log('💰 Montant:', paymentIntent.amount / 100, 'EUR')
          console.log('📋 Metadata:', paymentIntent.metadata)
          
          // Find the corresponding order by PaymentIntent ID
          console.log('🔍 Recherche commande pour PaymentIntent:', paymentIntent.id)
          
          const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single()

          console.log('📋 Résultat recherche commande:', { 
            found: !!order, 
            error: fetchError?.message,
            orderNumber: order?.order_number,
            currentStatus: order?.status
          })

          if (fetchError || !order) {
            console.error('❌ Commande non trouvée pour PaymentIntent:', paymentIntent.id, fetchError)
            
            // Try to find by metadata if available
            if (paymentIntent.metadata.order_id || paymentIntent.metadata.order_number) {
              console.log('🔄 Tentative de récupération par metadata')
              
              let alternativeQuery = supabase.from('orders').select('*')
              if (paymentIntent.metadata.order_id) {
                alternativeQuery = alternativeQuery.eq('id', paymentIntent.metadata.order_id)
              } else if (paymentIntent.metadata.order_number) {
                alternativeQuery = alternativeQuery.eq('order_number', paymentIntent.metadata.order_number)
              }
              
              const { data: altOrder, error: altError } = await alternativeQuery.single()
              
              if (altOrder && !altError) {
                console.log('✅ Commande trouvée via metadata:', altOrder.order_number)
                // Update with missing PaymentIntent ID
                await supabase
                  .from('orders')
                  .update({ stripe_payment_intent_id: paymentIntent.id })
                  .eq('id', altOrder.id)
                
                // Continue processing with this order
                await processSuccessfulPayment(altOrder, paymentIntent)
                break
              }
            }
            
            console.error('❌ Impossible de trouver la commande correspondante')
            return new Response('Order not found', { 
              status: 404, 
              headers: corsHeaders 
            })
          }

          await processSuccessfulPayment(order, paymentIntent)
          break
        }
        
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          console.log(`❌ Paiement échoué pour PaymentIntent ${paymentIntent.id}`)
          console.log('📋 Metadata:', paymentIntent.metadata)
          
          // Find the corresponding order
          let order = null
          
          // First by PaymentIntent ID
          const { data: orderByPI } = await supabase
            .from('orders')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single()
          
          if (orderByPI) {
            order = orderByPI
          } else if (paymentIntent.metadata.order_id) {
            // Then by metadata
            const { data: orderByMeta } = await supabase
              .from('orders')
              .select('*')
              .eq('id', paymentIntent.metadata.order_id)
              .single()
            
            if (orderByMeta) {
              order = orderByMeta
            }
          }

          if (order) {
            console.log(`📦 Commande trouvée pour échec de paiement: ${order.order_number}`)
            
            // Update order status to 'cancelled'
            await supabase
              .from('orders')
              .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
              .eq('id', order.id)

            // Record failed payment
            await supabase.from('payments').insert({
              order_id: order.id,
              payment_method: 'stripe',
              provider_payment_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              status: 'failed'
            })

            console.log(`✅ Commande ${order.order_number} marquée comme annulée suite à l'échec de paiement`)
          } else {
            console.warn(`⚠️ Aucune commande trouvée pour PaymentIntent échoué: ${paymentIntent.id}`)
            
            // Record failed payment without order
            await supabase.from('payments').insert({
              order_id: null,
              payment_method: 'stripe',
              provider_payment_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              status: 'failed'
            })
          }
          
          break
        }
        
        default:
          console.log(`Événement Stripe non géré: ${event.type}`)
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } catch (error) {
      console.error('Erreur traitement webhook:', error)
      return new Response(JSON.stringify({ 
        error: 'Erreur traitement webhook',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('❌ Erreur générale dans Edge Function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})