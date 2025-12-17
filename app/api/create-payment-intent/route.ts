import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import type { OrderRow, OrderItemInsert } from '@/lib/supabase/typed-client'

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
      idempotencyKey,
      // Champs pour les cadeaux
      isGift,
      recipientFirstName,
      recipientLastName,
      // Champs pour les codes promo
      discountCode,
      discountAmount
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

    // Valider le code promo côté serveur si fourni
    let validatedDiscountCode: string | null = null;
    let validatedDiscountAmount = 0;
    let discountCodeId: string | null = null;

    if (discountCode && typeof discountCode === 'string') {
      const { data: codeData, error: codeError } = await supabase
        .from('discount_codes')
        .select('id, code, amount, used')
        .ilike('code', discountCode.trim())
        .single()

      const typedCodeData = codeData as { id: string; code: string; amount: number; used: boolean | null } | null

      if (codeError || !typedCodeData) {
        return NextResponse.json(
          { error: 'Code promo invalide' },
          { status: 400 }
        )
      }

      if (typedCodeData.used) {
        return NextResponse.json(
          { error: 'Ce code promo a déjà été utilisé' },
          { status: 400 }
        )
      }

      // Code valide, on l'utilise
      validatedDiscountCode = typedCodeData.code;
      validatedDiscountAmount = Number(typedCodeData.amount);
      discountCodeId = typedCodeData.id;
    }

    // Recalculer le total avec la réduction validée
    const finalTotal = Math.max(0, Number(subtotal) + Number(shippingCost) - validatedDiscountAmount)

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
        total: finalTotal,
        status: 'pending',
        // Champs pour les cadeaux
        is_gift: isGift || false,
        recipient_first_name: recipientFirstName || null,
        recipient_last_name: recipientLastName || null,
        // Champs pour les codes promo
        discount_code: validatedDiscountCode,
        discount_amount: validatedDiscountAmount
      } as never)
      .select()
      .single()

    const typedOrder = order as OrderRow | null

    if (orderError || !typedOrder) {
      console.error('❌ Erreur création commande:', orderError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      )
    }

    console.log(`📝 Commande ${orderNumber} créée avec ID: ${typedOrder.id}`)

    // Créer les order_items
    const orderItems: OrderItemInsert[] = items.map((item: { productId: string; productName: string; productPrice: number; quantity: number }) => ({
      order_id: typedOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price: Number(item.productPrice),
      quantity: Number(item.quantity),
      total: Number(item.productPrice) * Number(item.quantity)
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems as never)

    if (itemsError) {
      console.error('❌ Erreur création order_items:', itemsError)
      // Supprimer la commande créée en cas d'erreur
      await supabase.from('orders').delete().eq('id', typedOrder.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création des articles de commande' },
        { status: 500 }
      )
    }

    // Marquer le code promo comme utilisé (si applicable)
    if (discountCodeId && validatedDiscountCode) {
      const { error: updateCodeError } = await supabase
        .from('discount_codes')
        .update({
          used: true,
          used_by_order_id: typedOrder.id,
          used_at: new Date().toISOString()
        } as never)
        .eq('id', discountCodeId)

      if (updateCodeError) {
        console.error('⚠️ Erreur mise à jour code promo:', updateCodeError)
        // On ne fait pas échouer la commande pour ça, mais on log l'erreur
      } else {
        console.log(`✅ Code promo ${validatedDiscountCode} marqué comme utilisé`)
      }
    }

    // NOTE: Le stock sera décrémenté et les mouvements créés UNIQUEMENT après
    // confirmation du paiement via le webhook Stripe ou sync-payments
    // Cela évite de bloquer du stock pour des commandes non payées

    // Créer le PaymentIntent Stripe avec référence à la commande
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100), // Stripe utilise les centimes
      currency: 'eur',
      description: `Commande ${orderNumber} - L'invisible`,
      receipt_email: email,
      metadata: {
        order_number: orderNumber,
        order_id: typedOrder.id,
        email,
        firstName,
        lastName,
        phone,
        discount_code: validatedDiscountCode || '',
        discount_amount: validatedDiscountAmount.toString()
      }
    })

    // Mettre à jour la commande avec le PaymentIntent ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id } as never)
      .eq('id', typedOrder.id)

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
          } as never)
      } catch (err) {
        console.warn('⚠️ Erreur analytics:', err)
      }
    }

    console.log(`✅ Commande ${orderNumber} créée avec PaymentIntent ${paymentIntent.id}`)

    const result = {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      orderId: typedOrder.id,
      orderNumber: orderNumber
    };

    // Mettre en cache le résultat avec la clé d'idempotence
    if (idempotencyKey && paymentIntent.client_secret) {
      processedKeys.set(idempotencyKey, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: typedOrder.id
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