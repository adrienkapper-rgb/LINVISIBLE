import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateOrderStatus, getOrderItems } from '@/lib/api/orders'
import { sendPaymentConfirmationEmail, sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email/service'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Fonction pour traiter un paiement réussi
async function processSuccessfulPayment(supabase: any, order: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`📦 Traitement paiement réussi pour commande ${order.order_number}`)
    
    // Vérifier si le paiement n'a pas déjà été traité
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('provider_payment_id', paymentIntent.id)
      .single()

    if (existingPayment && existingPayment.status === 'succeeded') {
      console.log(`⚠️ Paiement déjà traité pour ${paymentIntent.id}`)
      return
    }

    // Mettre à jour le statut de la commande à 'paid' (nouveau statut)
    const { error: statusError } = await updateOrderStatus(order.id, 'processing', paymentIntent.id)
    if (statusError) {
      console.error('❌ Erreur mise à jour statut commande:', statusError)
    }

    // Créer ou mettre à jour l'enregistrement de paiement
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

    // Récupérer les articles de la commande pour les emails
    const orderItems = await getOrderItems(order.id)
    
    // Envoyer les emails de confirmation (avec gestion d'erreur pour ne pas bloquer le webhook)
    try {
      await sendOrderConfirmationEmail({ order, orderItems })
      console.log(`📧 Email de confirmation commande envoyé pour ${order.order_number}`)
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email confirmation commande:', emailError)
    }
    
    try {
      await sendAdminNotificationEmail({ order, orderItems })
      console.log(`📧 Email admin envoyé pour commande ${order.order_number}`)
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email admin:', emailError)
    }

    try {
      await sendPaymentConfirmationEmail({ order, orderItems })
      console.log(`📧 Email de confirmation paiement envoyé pour ${order.order_number}`)
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email confirmation paiement:', emailError)
    }

    console.log(`✅ Paiement traité avec succès pour commande ${order.order_number}`)
    
  } catch (error) {
    console.error('❌ Erreur dans processSuccessfulPayment:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  console.log('🔗 Webhook Stripe reçu')
  console.log('📝 Body length:', body.length)
  console.log('🔑 Signature présente:', !!signature)
  console.log('🔐 Endpoint secret configuré:', !!endpointSecret)
  console.log('🔐 Endpoint secret value:', endpointSecret?.substring(0, 10) + '...')

  let event: Stripe.Event

  try {
    if (!endpointSecret) {
      console.log('⚠️ Webhook secret non configuré, processing en mode dev')
      event = JSON.parse(body)
    } else if (signature === 'test_signature') {
      console.log('🧪 Mode test manuel détecté')
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    }
    
    console.log('✅ Webhook événement parsé:', event.type)
    console.log('🆔 Event ID:', event.id)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        console.log('💳 Payment Intent succeeded:', paymentIntent.id)
        console.log('💰 Montant:', paymentIntent.amount / 100, 'EUR')
        console.log('📋 Metadata:', paymentIntent.metadata)
        
        try {
          const supabase = await createClient()
          
          // Récupérer la commande existante par PaymentIntent ID
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
            
            // Essayer de trouver par les metadata si disponibles
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
                // Mettre à jour avec le PaymentIntent ID manquant
                await supabase
                  .from('orders')
                  .update({ stripe_payment_intent_id: paymentIntent.id })
                  .eq('id', altOrder.id)
                
                // Continuer le traitement avec cette commande
                await processSuccessfulPayment(supabase, altOrder, paymentIntent)
                break
              }
            }
            
            console.error('❌ Impossible de trouver la commande correspondante')
            break
          }

          await processSuccessfulPayment(supabase, order, paymentIntent)
            
        } catch (error) {
          console.error('❌ Erreur traitement paiement réussi:', error)
        }
        
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`❌ Paiement échoué pour PaymentIntent ${paymentIntent.id}`)
        console.log('📋 Metadata:', paymentIntent.metadata)
        
        try {
          const supabase = await createClient()
          
          // Trouver la commande correspondante
          let order = null
          
          // D'abord par PaymentIntent ID
          const { data: orderByPI } = await supabase
            .from('orders')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single()
          
          if (orderByPI) {
            order = orderByPI
          } else if (paymentIntent.metadata.order_id) {
            // Ensuite par metadata
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
            
            // Mettre à jour le statut de la commande à 'cancelled'
            await supabase
              .from('orders')
              .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
              .eq('id', order.id)

            // Enregistrer le paiement échoué
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
            
            // Enregistrer le paiement échoué sans commande
            await supabase.from('payments').insert({
              order_id: null,
              payment_method: 'stripe',
              provider_payment_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              status: 'failed'
            })
          }
        } catch (error) {
          console.error('❌ Erreur traitement paiement échoué:', error)
        }
        
        break
      }
      
      default:
        console.log(`Événement Stripe non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur traitement webhook:', error)
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    )
  }
}