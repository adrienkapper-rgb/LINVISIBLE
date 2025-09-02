import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

// Cache des idempotency keys pour éviter les duplications
const processedKeys = new Map<string, { clientSecret: string; paymentIntentId: string; orderId: string }>();

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

    // Validation des items
    for (const item of items) {
      if (!item.productId || !item.productName || !item.productPrice || !item.quantity) {
        return NextResponse.json(
          { error: 'Données des articles invalides' },
          { status: 400 }
        )
      }
    }

    // Vérifier si cette clé d'idempotence a déjà été traitée
    if (idempotencyKey && processedKeys.has(idempotencyKey)) {
      const cached = processedKeys.get(idempotencyKey)!;
      return NextResponse.json({
        clientSecret: cached.clientSecret,
        paymentIntentId: cached.paymentIntentId,
        orderId: cached.orderId
      });
    }

    const supabase = await createClient()

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Créer la commande directement dans orders avec statut 'pending'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        mondial_relay_point: mondialRelayPoint || null,
        delivery_type: deliveryType as 'point-relais' | 'domicile',
        delivery_address: deliveryAddress || null,
        delivery_postal_code: deliveryPostalCode || null,
        delivery_city: deliveryCity || null,
        delivery_country: deliveryCountry || 'FR',
        subtotal: Number(subtotal),
        shipping_cost: Number(shippingCost),
        total: Number(total),
        status: 'pending'
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('❌ Erreur création commande:', orderError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      )
    }

    console.log(`📝 Commande ${orderNumber} créée avec ID: ${order.id}`)

    // Créer les order_items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price: Number(item.productPrice),
      quantity: Number(item.quantity),
      total: Number(item.productPrice) * Number(item.quantity)
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Erreur création order_items:', itemsError)
      // Supprimer la commande créée en cas d'erreur
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création des articles de commande' },
        { status: 500 }
      )
    }

    // Créer le PaymentIntent Stripe avec référence à la commande
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe utilise les centimes
      currency: 'eur',
      description: `Commande ${orderNumber} - L'invisible`,
      receipt_email: email,
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        email,
        firstName,
        lastName,
        phone
      }
    })

    // Mettre à jour la commande avec le PaymentIntent ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ Erreur mise à jour PaymentIntent ID:', updateError)
      // Ne pas faire échouer la requête, le webhook pourra gérer la synchronisation
    }

    // Ajouter les analytics d'achat (pour les statistiques)
    for (const item of items) {
      try {
        await supabase
          .from('product_analytics')
          .insert({
            product_id: item.productId,
            event_type: 'purchase',
            quantity: item.quantity
          })
      } catch (err) {
        console.warn('⚠️ Erreur analytics:', err)
      }
    }

    console.log(`✅ Commande ${orderNumber} créée avec PaymentIntent ${paymentIntent.id}`)

    const result = {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      orderNumber: orderNumber
    };

    // Mettre en cache le résultat avec la clé d'idempotence
    if (idempotencyKey && paymentIntent.client_secret) {
      processedKeys.set(idempotencyKey, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order.id
      });
      
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