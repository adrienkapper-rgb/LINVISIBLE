import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateOrderStatus, getOrderByNumber, getOrderItems } from '@/lib/api/orders'
// Emails are now sent at order creation, not via webhook

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    if (!endpointSecret) {
      console.log('⚠️ Webhook secret non configuré, processing en mode dev')
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    }
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
        const orderId = paymentIntent.metadata.orderId
        
        if (orderId) {
          await updateOrderStatus(orderId, 'processing', paymentIntent.id)
          console.log(`✅ Commande ${orderId} marquée comme payée`)
          
          // Emails are sent at order creation, no need to send them here
          console.log(`💳 Paiement confirmé pour commande ${paymentIntent.metadata.orderNumber}`)
        }
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId
        
        if (orderId) {
          await updateOrderStatus(orderId, 'cancelled')
          console.log(`❌ Paiement échoué pour commande ${orderId}`)
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