import { Resend } from 'npm:resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

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
  created_at: string
}

interface OrderItem {
  product_name: string
  product_price: number
  quantity: number
  total: number
}

interface RequestBody {
  order: OrderData
  orderItems: OrderItem[]
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: OrderData
  old_record: null | OrderData
}

function generateOrderConfirmationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.product_price.toFixed(2)}€</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.total.toFixed(2)}€</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de commande</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Merci pour votre commande !</h1>
        
        <p>Bonjour <strong>${order.first_name} ${order.last_name}</strong>,</p>
        
        <p>Nous avons bien reçu votre commande <strong>#${order.order_number}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 10px; text-align: left;">Produit</th>
                <th style="padding: 10px; text-align: center;">Quantité</th>
                <th style="padding: 10px; text-align: right;">Prix unitaire</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #2c3e50;">
            <table style="width: 100%;">
              <tr>
                <td style="text-align: right; padding: 5px;"><strong>Sous-total:</strong></td>
                <td style="text-align: right; padding: 5px; width: 100px;">${order.subtotal.toFixed(2)}€</td>
              </tr>
              <tr>
                <td style="text-align: right; padding: 5px;"><strong>Livraison:</strong></td>
                <td style="text-align: right; padding: 5px;">${order.shipping_cost.toFixed(2)}€</td>
              </tr>
              <tr style="font-size: 18px; font-weight: bold;">
                <td style="text-align: right; padding: 10px; border-top: 1px solid #ccc;"><strong>Total:</strong></td>
                <td style="text-align: right; padding: 10px; border-top: 1px solid #ccc;">${order.total.toFixed(2)}€</td>
              </tr>
            </table>
          </div>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Informations de livraison</h4>
          ${order.delivery_type === 'point-relais' ? `
            <p><strong>Point Relais:</strong> ${order.mondial_relay_point || 'À confirmer'}</p>
          ` : `
            <p><strong>Adresse:</strong><br>
            ${order.delivery_address}<br>
            ${order.delivery_postal_code} ${order.delivery_city}<br>
            ${order.delivery_country}</p>
          `}
        </div>

        <p>Votre commande sera traitée dans les plus brefs délais. Vous recevrez une confirmation de paiement ainsi qu'un suivi de livraison par email.</p>
        
        <p>Merci de votre confiance !</p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          L'INVISIBLE - Cocktails premium<br>
          En cas de question, contactez-nous à contact@linvisible.fr
        </p>
      </div>
    </body>
    </html>
  `
}

Deno.serve(async (req: Request) => {
  // Headers CORS pour autoriser les appels cross-origin
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const bodyText = await req.text()
    let order: OrderData
    let orderItems: OrderItem[] = []

    try {
      const body = JSON.parse(bodyText)
      
      // Vérifier si c'est un webhook Supabase (automatique)
      if (body.type && body.record && body.table === 'orders') {
        console.log('📨 Webhook reçu pour nouvelle commande')
        const webhookPayload: WebhookPayload = body
        order = webhookPayload.record
        
        // Pour les webhooks, on récupère les items via une requête à la DB
        // Note: Pour simplifier, on peut aussi les passer via le webhook si nécessaire
        orderItems = [] // Sera récupéré si nécessaire
      } else {
        // Appel direct avec données complètes
        console.log('📨 Appel direct à l\'edge function')
        const requestBody: RequestBody = body
        order = requestBody.order
        orderItems = requestBody.orderItems || []
      }
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError)
      return new Response('Invalid JSON payload', { status: 400 })
    }

    // Valider les données requises
    if (!order || !order.email || !order.order_number) {
      return new Response('Missing required order data', { status: 400 })
    }

    // Envoyer l'email à adrienkapper@gmail.com (email de test demandé)
    const targetEmail = 'adrienkapper@gmail.com'
    console.log(`📧 Envoi email de confirmation commande ${order.order_number} vers ${targetEmail}`)
    
    const { error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [targetEmail],
      subject: `Confirmation de commande #${order.order_number}`,
      html: generateOrderConfirmationTemplate(order, orderItems || []),
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`✅ Email de confirmation envoyé pour commande ${order.order_number}`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erreur dans Edge Function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})