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
  // Champs pour les cadeaux
  is_gift?: boolean
  recipient_first_name?: string
  recipient_last_name?: string
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

function generateAdminNotificationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #cbb9a8; color: #2d2316;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #cbb9a8; text-align: center; color: #2d2316;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #cbb9a8; text-align: right; color: #2d2316; font-weight: 500;">${item.total.toFixed(2)} €</td>
    </tr>
  `).join('')

  const deliveryInfo = order.delivery_type === 'point-relais' 
    ? formatAddressForEmail(order.mondial_relay_point)
    : `${order.delivery_address}, ${order.delivery_postal_code} ${order.delivery_city}, ${order.delivery_country}`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle commande - Admin L'INVISIBLE</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2d2316; margin: 0; padding: 0; background-color: #ddd0c4;">
      <div style="max-width: 600px; margin: 20px auto; background: #e8dfd6; border: 1px solid #cbb9a8;">
        
        <div style="background: #d4c4b8; color: #2d2316; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; font-family: Georgia, serif;">Nouvelle commande</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">#${order.order_number}</p>
        </div>

        <div style="padding: 25px;">
          
          <div style="background: #f2ede7; padding: 20px; margin-bottom: 20px; border: 1px solid #cbb9a8;">
            <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #2d2316; border-bottom: 2px solid #d4c4b8; padding-bottom: 5px;">Informations client</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; width: 100px; color: #5c5245;">Nom:</td>
                <td style="padding: 5px 0; color: #2d2316; font-weight: 500;">${order.first_name} ${order.last_name}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #5c5245;">Email:</td>
                <td style="padding: 5px 0;"><a href="mailto:${order.email}" style="color: #2d2316; text-decoration: none; font-weight: 500;">${order.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #5c5245;">Téléphone:</td>
                <td style="padding: 5px 0; color: #2d2316; font-weight: 500;">${order.phone}</td>
              </tr>
              ${order.is_gift && order.recipient_first_name && order.recipient_last_name ? `
              <tr>
                <td style="padding: 10px 0 5px 0; color: #2d2316; font-weight: 600;" colspan="2">🎁 Cadeau pour:</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #5c5245;">Destinataire:</td>
                <td style="padding: 5px 0; color: #2d2316; font-weight: 500;">${order.recipient_first_name} ${order.recipient_last_name}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #f2ede7; padding: 20px; margin-bottom: 20px; border: 1px solid #cbb9a8;">
            <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #2d2316; border-bottom: 2px solid #d4c4b8; padding-bottom: 5px;">Livraison</h3>
            <p style="margin: 0; font-size: 14px; color: #5c5245; line-height: 1.6;">
              <strong style="color: #2d2316;">${order.delivery_type === 'point-relais' ? 'Point Relais' : 'Domicile'}</strong><br>
              ${deliveryInfo}
            </p>
          </div>

          <div style="background: #f2ede7; padding: 20px; margin-bottom: 20px; border: 1px solid #cbb9a8;">
            <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #2d2316; border-bottom: 2px solid #d4c4b8; padding-bottom: 5px;">Articles commandés</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; background: white;">
              <thead>
                <tr style="background: #d4c4b8;">
                  <th style="padding: 10px; text-align: left; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #2d2316;">Produit</th>
                  <th style="padding: 10px; text-align: center; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #2d2316;">Qté</th>
                  <th style="padding: 10px; text-align: right; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #2d2316;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="background: #f2ede7; padding: 20px; margin-bottom: 20px; border: 1px solid #cbb9a8; border-left: 4px solid #d4c4b8;">
            <h3 style="margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #2d2316; font-family: Georgia, serif;">Résumé financier</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; color: #5c5245;">Sous-total:</td>
                <td style="text-align: right; padding: 5px 0; color: #2d2316; font-weight: 500;">${order.subtotal.toFixed(2)} €</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #5c5245;">Livraison:</td>
                <td style="text-align: right; padding: 5px 0; color: #2d2316; font-weight: 500;">${order.shipping_cost.toFixed(2)} €</td>
              </tr>
              <tr style="border-top: 2px solid #d4c4b8;">
                <td style="padding: 15px 0 5px 0; font-size: 18px; font-weight: 600; color: #2d2316; text-transform: uppercase; letter-spacing: 1px;">Total payé:</td>
                <td style="text-align: right; padding: 15px 0 5px 0; font-size: 18px; font-weight: 600; color: #2d2316;">${order.total.toFixed(2)} €</td>
              </tr>
            </table>
          </div>

          <div style="background: #d4c4b8; color: #2d2316; padding: 20px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Action requise</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; opacity: 0.8;">Traiter cette commande dans le système de gestion</p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #cbb9a8;">
            <p style="font-size: 12px; color: #5c5245; margin: 0;">
              Notification automatique - L'INVISIBLE<br>
              <span style="opacity: 0.7;">${new Date(order.created_at).toLocaleString('fr-FR')}</span>
            </p>
          </div>
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
    console.log('📧 Edge Function send-admin-notification appelée')

    const body: RequestBody = await req.json()
    const { order, orderItems } = body
    const adminEmail = Deno.env.get('ADMIN_EMAIL')

    // Validate required data
    if (!order || !order.email || !order.order_number) {
      console.error('❌ Données de commande manquantes')
      return new Response('Missing required order data', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    if (!adminEmail) {
      console.error('❌ ADMIN_EMAIL non configuré')
      return new Response('Admin email not configured', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    console.log(`Envoi notification admin pour commande ${order.order_number}`)
    console.log(`Admin: ${adminEmail}`)
    console.log(`Montant: ${order.total} €`)
    
    const { data, error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
      to: [adminEmail],
      subject: `Nouvelle commande #${order.order_number} - ${order.total.toFixed(2)} €`,
      html: generateAdminNotificationTemplate(order, orderItems || []),
    })

    if (error) {
      console.error('❌ Erreur envoi email admin:', error)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to send admin email',
        details: error.message,
        orderNumber: order.order_number
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Email admin envoyé avec succès`)
    console.log(`Email ID: ${data?.id}`)
    console.log(`Commande: ${order.order_number}`)
    console.log(`Client: ${order.first_name} ${order.last_name}`)
    console.log(`Admin: ${adminEmail}`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin notification email sent successfully',
      data: {
        emailId: data?.id,
        orderNumber: order.order_number,
        adminEmail
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur générale dans send-admin-notification:', error)
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