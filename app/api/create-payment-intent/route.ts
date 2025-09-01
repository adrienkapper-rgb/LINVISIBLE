import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createOrder } from '@/lib/api/orders'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

// Cache des idempotency keys pour éviter les duplications
const processedKeys = new Map<string, { orderId: string; orderNumber: string; clientSecret: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      email,
      firstName,
      lastName,
      phone,
      mondialRelayPoint,
      deliveryType,
      deliveryAddress,
      deliveryPostalCode,
      deliveryCity,
      deliveryCountry,
      items,
      subtotal,
      shippingCost,
      total,
      idempotencyKey
    } = body
    
    // Validation des données requises
    if (!email || !firstName || !lastName || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Données requises manquantes' },
        { status: 400 }
      )
    }

    // Vérifier si cette clé d'idempotence a déjà été traitée
    if (idempotencyKey && processedKeys.has(idempotencyKey)) {
      const cached = processedKeys.get(idempotencyKey)!;
      return NextResponse.json(cached);
    }

    // Vérifier aussi dans la base de données si une commande récente existe
    const supabase = await createClient();
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 5000).toISOString()) // Commandes des 5 dernières secondes
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentOrders && recentOrders.length > 0) {
      
      // Vérifier si un payment intent existe déjà pour cette commande
      try {
        const paymentIntents = await stripe.paymentIntents.list({
          limit: 10,
        });
        
        const existingIntent = paymentIntents.data.find(
          pi => pi.metadata.orderId === recentOrders[0].id
        );
        
        if (existingIntent && existingIntent.client_secret) {
          const result = {
            clientSecret: existingIntent.client_secret,
            orderId: recentOrders[0].id,
            orderNumber: recentOrders[0].order_number
          };
          
          if (idempotencyKey) {
            processedKeys.set(idempotencyKey, result);
          }
          
          return NextResponse.json(result);
        }
      } catch (stripeError) {
        console.error('Error checking existing payment intents:', stripeError);
      }
    }

    // Créer la commande dans Supabase
    const { order, error: orderError } = await createOrder({
      email,
      firstName,
      lastName,
      phone,
      mondialRelayPoint,
      deliveryType,
      deliveryAddress,
      deliveryPostalCode,
      deliveryCity,
      deliveryCountry,
      items,
      subtotal,
      shippingCost,
      total
    })

    if (orderError || !order) {
      return NextResponse.json(
        { error: `Erreur lors de la création de la commande: ${orderError?.message || 'Erreur inconnue'}` },
        { status: 400 }
      )
    }
    

    // Créer le PaymentIntent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe utilise les centimes
      currency: 'eur',
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number
      },
      description: `Commande L'invisible - ${order.order_number}`,
      receipt_email: email
    })

    const result = {
      clientSecret: paymentIntent.client_secret!,
      orderId: order.id,
      orderNumber: order.order_number
    };

    // Mettre en cache le résultat avec la clé d'idempotence
    if (idempotencyKey && paymentIntent.client_secret) {
      processedKeys.set(idempotencyKey, result);
      
      // Nettoyer le cache après 5 minutes
      setTimeout(() => {
        processedKeys.delete(idempotencyKey);
      }, 5 * 60 * 1000);
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in payment intent creation:', error)
    
    return NextResponse.json(
      { error: `Erreur lors de la création du paiement: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}