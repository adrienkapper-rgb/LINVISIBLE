import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createOrder, updateOrderStatus, getOrderByNumber, getOrderItems } from '@/lib/api/orders'
import { sendPaymentConfirmationEmail, sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email/service'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  console.log('🔗 Webhook Stripe reçu')
  console.log('📝 Body length:', body.length)
  console.log('🔑 Signature présente:', !!signature)
  console.log('🔐 Endpoint secret configuré:', !!endpointSecret)

  let event: Stripe.Event

  try {
    if (!endpointSecret) {
      console.log('⚠️ Webhook secret non configuré, processing en mode dev')
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
        
        try {
          // Récupérer les données de commande depuis pending_orders
          const supabase = await createClient()
          const { data: pendingOrder, error: fetchError } = await supabase
            .from('pending_orders')
            .select('*')
            .eq('payment_intent_id', paymentIntent.id)
            .single()

          if (fetchError || !pendingOrder) {
            console.error('❌ Pending order non trouvée pour PaymentIntent:', paymentIntent.id, fetchError)
            break
          }

          console.log('📦 Données de commande récupérées:', pendingOrder.email)

          // Créer la vraie commande maintenant que le paiement est validé
          const orderData = {
            email: pendingOrder.email,
            firstName: pendingOrder.first_name,
            lastName: pendingOrder.last_name,
            phone: pendingOrder.phone,
            mondialRelayPoint: pendingOrder.mondial_relay_point,
            deliveryType: pendingOrder.delivery_type as 'point-relais' | 'domicile',
            deliveryAddress: pendingOrder.delivery_address,
            deliveryPostalCode: pendingOrder.delivery_postal_code,
            deliveryCity: pendingOrder.delivery_city,
            deliveryCountry: pendingOrder.delivery_country,
            items: JSON.parse(pendingOrder.items as string),
            subtotal: Number(pendingOrder.subtotal),
            shippingCost: Number(pendingOrder.shipping_cost),
            total: Number(pendingOrder.total)
          }

          const { order, error: orderError } = await createOrder(orderData)
          
          if (orderError || !order) {
            console.error('❌ Erreur création commande après paiement:', orderError)
            break
          }

          console.log(`✅ Commande ${order.order_number} créée après paiement validé`)

          // Mettre à jour le statut directement à 'processing' et ajouter le PaymentIntent ID
          await updateOrderStatus(order.id, 'processing', paymentIntent.id)

          // Créer l'enregistrement de paiement
          await supabase.from('payments').insert({
            order_id: order.id,
            payment_method: 'stripe',
            provider_payment_id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            status: 'succeeded'
          })

          // Envoyer les emails de confirmation
          const orderItems = await getOrderItems(order.id)
          
          // Email de confirmation de commande au client
          await sendOrderConfirmationEmail({ order, orderItems })
          console.log(`📧 Email de confirmation commande envoyé pour ${order.order_number}`)
          
          // Email de notification à l'admin
          await sendAdminNotificationEmail({ order, orderItems })
          console.log(`📧 Email admin envoyé pour commande ${order.order_number}`)

          // Email de confirmation de paiement
          await sendPaymentConfirmationEmail({ order, orderItems })
          console.log(`📧 Email de confirmation paiement envoyé pour ${order.order_number}`)

          // Nettoyer la pending_order
          await supabase
            .from('pending_orders')
            .delete()
            .eq('payment_intent_id', paymentIntent.id)

          console.log(`🧹 Pending order nettoyée pour ${paymentIntent.id}`)
            
        } catch (error) {
          console.error('❌ Erreur traitement paiement réussi:', error)
        }
        
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`❌ Paiement échoué pour PaymentIntent ${paymentIntent.id}`)
        
        try {
          // Nettoyer la pending_order en cas d'échec de paiement
          const supabase = await createClient()
          const { error } = await supabase
            .from('pending_orders')
            .delete()
            .eq('payment_intent_id', paymentIntent.id)

          if (error) {
            console.error('❌ Erreur nettoyage pending order après échec:', error)
          } else {
            console.log(`🧹 Pending order nettoyée après échec pour ${paymentIntent.id}`)
          }

          // Enregistrer le paiement échoué si on a les données
          const { data: pendingOrder } = await supabase
            .from('pending_orders')
            .select('*')
            .eq('payment_intent_id', paymentIntent.id)
            .single()

          if (pendingOrder) {
            await supabase.from('payments').insert({
              order_id: null, // Pas de commande créée
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