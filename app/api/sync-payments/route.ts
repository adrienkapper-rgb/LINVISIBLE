import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { updateOrderStatus, getOrderItems } from '@/lib/api/orders'
import { sendOrderConfirmationEmail, sendAdminNotificationEmail, sendPaymentConfirmationEmail } from '@/lib/email/service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function POST(request: NextRequest) {
  try {
    const { mode = 'check', limit = 50 } = await request.json().catch(() => ({}))
    
    console.log(`🔄 Démarrage synchronisation paiements (mode: ${mode}, limite: ${limit})`)
    
    const supabase = await createClient()
    const results = {
      checked: 0,
      synchronized: 0,
      errors: [] as string[]
    }

    // Récupérer les commandes en attente avec PaymentIntent ID
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .not('stripe_payment_intent_id', 'is', null)
      .limit(limit)

    if (fetchError) {
      console.error('❌ Erreur récupération commandes pending:', fetchError)
      return NextResponse.json({ error: 'Erreur récupération des commandes' }, { status: 500 })
    }

    console.log(`📊 ${pendingOrders?.length || 0} commandes pending avec PaymentIntent ID trouvées`)

    for (const order of pendingOrders || []) {
      results.checked++
      
      try {
        console.log(`🔍 Vérification PaymentIntent ${order.stripe_payment_intent_id} pour commande ${order.order_number}`)
        
        // Récupérer le PaymentIntent depuis Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)
        
        console.log(`📋 PaymentIntent ${paymentIntent.id} - Statut: ${paymentIntent.status}`)
        
        // Vérifier si le paiement a réussi mais n'a pas été synchronisé
        if (paymentIntent.status === 'succeeded') {
          // Vérifier s'il n'y a pas déjà un enregistrement de paiement
          const { data: existingPayment } = await supabase
            .from('payments')
            .select('id, status')
            .eq('provider_payment_id', paymentIntent.id)
            .single()

          if (!existingPayment || existingPayment.status !== 'succeeded') {
            console.log(`✅ Synchronisation nécessaire pour ${order.order_number}`)
            
            if (mode === 'sync') {
              // Mettre à jour le statut de la commande
              await updateOrderStatus(order.id, 'processing', paymentIntent.id)
              
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
              
              // Envoyer les emails s'ils n'ont pas été envoyés
              try {
                const orderItems = await getOrderItems(order.id)
                
                await sendOrderConfirmationEmail({ order, orderItems })
                await sendAdminNotificationEmail({ order, orderItems })
                await sendPaymentConfirmationEmail({ order, orderItems })
                
                console.log(`📧 Emails envoyés pour ${order.order_number}`)
              } catch (emailError) {
                console.error(`⚠️ Erreur envoi emails pour ${order.order_number}:`, emailError)
              }
              
              results.synchronized++
              console.log(`✅ Commande ${order.order_number} synchronisée`)
            } else {
              results.synchronized++ // Compter comme "à synchroniser" en mode check
            }
          } else {
            console.log(`✅ Commande ${order.order_number} déjà synchronisée`)
          }
        } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'payment_failed') {
          console.log(`❌ PaymentIntent ${paymentIntent.id} a échoué ou été annulé`)
          
          if (mode === 'sync') {
            // Mettre à jour le statut de la commande à cancelled
            await supabase
              .from('orders')
              .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
              .eq('id', order.id)
            
            // Enregistrer le paiement échoué s'il n'existe pas
            const { data: existingPayment } = await supabase
              .from('payments')
              .select('id')
              .eq('provider_payment_id', paymentIntent.id)
              .single()
              
            if (!existingPayment) {
              await supabase.from('payments').insert({
                order_id: order.id,
                payment_method: 'stripe',
                provider_payment_id: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency.toUpperCase(),
                status: paymentIntent.status === 'canceled' ? 'cancelled' : 'failed'
              })
            }
            
            console.log(`❌ Commande ${order.order_number} marquée comme annulée`)
          }
        } else {
          console.log(`⏳ PaymentIntent ${paymentIntent.id} en attente (${paymentIntent.status})`)
        }
        
      } catch (error) {
        const errorMsg = `Erreur traitement commande ${order.order_number}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        console.error('❌', errorMsg)
        results.errors.push(errorMsg)
      }
    }

    // Récupérer aussi les commandes sans PaymentIntent ID mais récentes
    const { data: ordersWithoutPI, error: fetchError2 } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .is('stripe_payment_intent_id', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Dernières 24h
      .limit(20)

    if (!fetchError2 && ordersWithoutPI && ordersWithoutPI.length > 0) {
      console.log(`🔍 ${ordersWithoutPI.length} commandes sans PaymentIntent ID trouvées`)
      
      for (const order of ordersWithoutPI) {
        try {
          // Chercher dans les PaymentIntents Stripe par metadata
          const searchParams = {
            limit: 10,
            created: {
              gte: Math.floor(new Date(order.created_at).getTime() / 1000) - 300 // 5 minutes avant
            }
          }
          
          const paymentIntents = await stripe.paymentIntents.list(searchParams)
          
          // Chercher par email ou nom dans les metadata
          const matchingPI = paymentIntents.data.find(pi => 
            pi.metadata.email === order.email ||
            pi.metadata.order_number === order.order_number ||
            pi.metadata.order_id === order.id
          )
          
          if (matchingPI && mode === 'sync') {
            console.log(`🔗 PaymentIntent ${matchingPI.id} trouvé pour commande ${order.order_number}`)
            
            // Mettre à jour la commande avec le PaymentIntent ID
            await supabase
              .from('orders')
              .update({ stripe_payment_intent_id: matchingPI.id })
              .eq('id', order.id)
              
            console.log(`✅ PaymentIntent ID ajouté à la commande ${order.order_number}`)
            results.synchronized++
          }
          
        } catch (error) {
          console.error(`❌ Erreur recherche PaymentIntent pour ${order.order_number}:`, error)
        }
      }
    }

    const summary = {
      mode,
      results,
      message: mode === 'check' 
        ? `${results.synchronized} commande(s) nécessitent une synchronisation`
        : `${results.synchronized} commande(s) synchronisée(s)`
    }

    console.log(`✅ Synchronisation terminée:`, summary)
    
    return NextResponse.json(summary)

  } catch (error) {
    console.error('❌ Erreur synchronisation paiements:', error)
    return NextResponse.json(
      { error: `Erreur synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}

// API GET pour vérification rapide du statut
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Statistiques des commandes
    const { data: stats } = await supabase
      .from('orders')
      .select('status')
      .neq('status', 'delivered') // Exclure les commandes livrées
    
    const statusCounts = stats?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Commandes pending récentes (dernières 24h)
    const { data: recentPending } = await supabase
      .from('orders')
      .select('id, order_number, created_at, stripe_payment_intent_id')
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const pendingWithPI = recentPending?.filter(o => o.stripe_payment_intent_id) || []
    const pendingWithoutPI = recentPending?.filter(o => !o.stripe_payment_intent_id) || []

    return NextResponse.json({
      stats: statusCounts,
      recentPending: {
        total: recentPending?.length || 0,
        withPaymentIntent: pendingWithPI.length,
        withoutPaymentIntent: pendingWithoutPI.length
      },
      needsSync: pendingWithPI.length > 0
    })

  } catch (error) {
    return NextResponse.json(
      { error: `Erreur récupération statut: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}