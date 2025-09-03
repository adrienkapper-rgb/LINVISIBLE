import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  created_at: string
}

interface OrderItem {
  id: string
  order_id: string
  product_name: string
  product_price: number
  quantity: number
  total: number
}

interface RequestBody {
  order: OrderData
  orderItems: OrderItem[]
}

function formatAddressForEmail(address: string | null | undefined): string {
  if (!address) return 'À confirmer';
  // Remplacer les retours à la ligne par des <br> HTML
  return address.replace(/\n/g, '<br>');
}

function generateOrderConfirmationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #cbb9a8; color: #2d2316; font-family: Georgia, serif;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #cbb9a8; text-align: center; color: #2d2316;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #cbb9a8; text-align: right; color: #2d2316;">${item.product_price.toFixed(2)} €</td>
      <td style="padding: 12px; border-bottom: 1px solid #cbb9a8; text-align: right; font-weight: 500; color: #2d2316;">${item.total.toFixed(2)} €</td>
    </tr>
  `).join('')

  const deliveryInfoHtml = order.delivery_type === 'point-relais' ? `
    <div style="background: #f2ede7; padding: 25px; margin: 30px 0; border-left: 4px solid #d4c4b8;">
      <h4 style="margin: 0 0 15px 0; color: #2d2316; font-family: Georgia, serif; font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Livraison</h4>
      <p style="margin: 0; color: #5c5245; font-size: 14px;"><strong style="color: #2d2316;">Point Relais</strong><br>${formatAddressForEmail(order.mondial_relay_point)}</p>
    </div>
  ` : `
    <div style="background: #f2ede7; padding: 25px; margin: 30px 0; border-left: 4px solid #d4c4b8;">
      <h4 style="margin: 0 0 15px 0; color: #2d2316; font-family: Georgia, serif; font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Livraison</h4>
      <p style="margin: 0; color: #5c5245; font-size: 14px; line-height: 1.6;">
      ${order.delivery_address}<br>
      ${order.delivery_postal_code} ${order.delivery_city}<br>
      ${order.delivery_country}
      </p>
    </div>
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande - L'INVISIBLE</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2d2316; margin: 0; padding: 0; background-color: #ddd0c4;">
      <div style="max-width: 600px; margin: 0 auto; background: #e8dfd6;">
        
        <!-- Header -->
        <div style="background: #d4c4b8; color: #2d2316; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif; text-transform: uppercase;">L'INVISIBLE</h1>
          <p style="margin: 15px 0 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;">Confirmation de commande</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; margin: 0 0 30px 0; color: #2d2316;">Bonjour ${order.first_name} ${order.last_name},</p>
          
          <p style="margin: 0 0 30px 0; color: #5c5245; line-height: 1.8;">Nous avons le plaisir de vous confirmer que votre commande <strong style="color: #2d2316;">#${order.order_number}</strong> a été enregistrée et votre paiement validé.</p>
          
          <!-- Order Details -->
          <div style="background: #f2ede7; padding: 30px; margin: 30px 0; border: 1px solid #cbb9a8;">
            <h3 style="margin: 0 0 25px 0; color: #2d2316; font-family: Georgia, serif; font-size: 18px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #d4c4b8; padding-bottom: 10px;">Détails de la commande</h3>
            <table style="width: 100%; border-collapse: collapse; background: white;">
              <thead>
                <tr style="background: #d4c4b8;">
                  <th style="padding: 12px; text-align: left; font-weight: 500; color: #2d2316; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Produit</th>
                  <th style="padding: 12px; text-align: center; font-weight: 500; color: #2d2316; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Qté</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; color: #2d2316; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Prix</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; color: #2d2316; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #d4c4b8; background: white; padding: 20px;">
              <table style="width: 100%;">
                <tr>
                  <td style="text-align: right; padding: 5px 0; color: #5c5245;">Sous-total</td>
                  <td style="text-align: right; padding: 5px 0; width: 100px; color: #2d2316; font-weight: 500;">${order.subtotal.toFixed(2)} €</td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 5px 0; color: #5c5245;">Livraison</td>
                  <td style="text-align: right; padding: 5px 0; color: #2d2316; font-weight: 500;">${order.shipping_cost.toFixed(2)} €</td>
                </tr>
                <tr style="border-top: 2px solid #d4c4b8;">
                  <td style="text-align: right; padding: 15px 0 5px 0; font-size: 18px; font-weight: 600; color: #2d2316; text-transform: uppercase; letter-spacing: 1px;">Total</td>
                  <td style="text-align: right; padding: 15px 0 5px 0; font-size: 18px; font-weight: 600; color: #2d2316;">${order.total.toFixed(2)} €</td>
                </tr>
              </table>
            </div>
          </div>

          ${deliveryInfoHtml}

          <p style="margin: 30px 0; color: #5c5245; line-height: 1.8; font-size: 14px;">Votre commande sera préparée avec le plus grand soin et expédiée dans les meilleurs délais. Un email de suivi vous sera envoyé dès l'expédition de votre colis.</p>
          
          <div style="margin: 40px 0; padding-top: 30px; border-top: 1px solid #cbb9a8; text-align: center;">
            <p style="margin: 0; color: #5c5245; font-size: 13px;">Pour toute question, contactez-nous à<br>
            <a href="mailto:contact@cocktails-linvisible.fr" style="color: #2d2316; text-decoration: none; font-weight: 500;">contact@cocktails-linvisible.fr</a></p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #d4c4b8; padding: 30px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #2d2316; letter-spacing: 1px; text-transform: uppercase; opacity: 0.8;">
            L'INVISIBLE<br>
            <span style="font-size: 11px; text-transform: none; letter-spacing: normal;">Cocktails d'exception</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('📧 Edge Function send-order-confirmation appelée')

    const body: RequestBody = await req.json()
    const { order, orderItems } = body

    // Validate required data
    if (!order || !order.email || !order.order_number) {
      console.error('❌ Données de commande manquantes')
      return new Response('Missing required order data', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    console.log(`Envoi email de confirmation pour commande ${order.order_number}`)
    console.log(`Destinataire: ${order.email}`)
    console.log(`Client: ${order.first_name} ${order.last_name}`)
    
    const { data, error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
      to: [order.email],
      subject: `Commande confirmée #${order.order_number} - L'INVISIBLE`,
      html: generateOrderConfirmationTemplate(order, orderItems || []),
    })

    if (error) {
      console.error('❌ Erreur envoi email:', error)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to send email',
        details: error.message,
        orderNumber: order.order_number
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Email de confirmation envoyé avec succès`)
    console.log(`Email ID: ${data?.id}`)
    console.log(`Commande: ${order.order_number}`)
    console.log(`Client: ${order.first_name} ${order.last_name} (${order.email})`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order confirmation email sent successfully',
      data: {
        emailId: data?.id,
        orderNumber: order.order_number,
        targetEmail: order.email
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur générale dans send-order-confirmation:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})