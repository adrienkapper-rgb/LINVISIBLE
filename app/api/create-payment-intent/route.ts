import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

// Cache des idempotency keys pour éviter les duplications
const processedKeys = new Map<string, { clientSecret: string; paymentIntentId: string }>();

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

    // Créer le PaymentIntent Stripe en premier
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe utilise les centimes
      currency: 'eur',
      description: `Commande L'invisible`,
      receipt_email: email,
      metadata: {
        // Stocker les données de commande dans les metadata (limité à 500 chars par clé)
        email,
        firstName,
        lastName,
        phone
      }
    })

    // Stocker les données complètes de commande dans pending_orders
    const supabase = await createClient()
    const { error: pendingOrderError } = await supabase
      .from('pending_orders')
      .insert({
        payment_intent_id: paymentIntent.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        mondial_relay_point: mondialRelayPoint,
        delivery_type: deliveryType as 'point-relais' | 'domicile',
        delivery_address: deliveryAddress,
        delivery_postal_code: deliveryPostalCode,
        delivery_city: deliveryCity,
        delivery_country: deliveryCountry || 'FR',
        items: JSON.stringify(items),
        subtotal: Number(subtotal),
        shipping_cost: Number(shippingCost),
        total: Number(total)
      })

    if (pendingOrderError) {
      console.error('❌ Erreur sauvegarde pending order:', pendingOrderError)
      // Annuler le PaymentIntent si on ne peut pas sauvegarder les données
      await stripe.paymentIntents.cancel(paymentIntent.id)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde temporaire des données' },
        { status: 500 }
      )
    }

    console.log(`💾 Données de commande sauvegardées temporairement pour PaymentIntent ${paymentIntent.id}`)

    const result = {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id
    };

    // Mettre en cache le résultat avec la clé d'idempotence
    if (idempotencyKey && paymentIntent.client_secret) {
      processedKeys.set(idempotencyKey, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
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