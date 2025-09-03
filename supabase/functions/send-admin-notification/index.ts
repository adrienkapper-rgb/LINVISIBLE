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

function generateAdminNotificationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.total.toFixed(2)}€</td>
    </tr>
  `).join('')

  const deliveryInfo = order.delivery_type === 'point-relais' 
    ? `Point Relais: ${order.mondial_relay_point || 'À confirmer'}`
    : `Adresse: ${order.delivery_address}, ${order.delivery_postal_code} ${order.delivery_city}, ${order.delivery_country}`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle commande - Admin</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: #28a745; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="margin: 0;">🎉 Nouvelle commande payée !</h1>
          <p style="margin: 5px 0 0 0;">Commande #${order.order_number}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0;">👤 Informations client</h3>
          <p><strong>Nom:</strong> ${order.first_name} ${order.last_name}</p>
          <p><strong>Email:</strong> <a href="mailto:${order.email}">${order.email}</a></p>
          <p><strong>Téléphone:</strong> ${order.phone}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0;">📦 Livraison</h3>
          <p><strong>Type:</strong> ${order.delivery_type === 'point-relais' ? 'Point Relais' : 'Domicile'}</p>
          <p><strong>Détails:</strong> ${deliveryInfo}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0;">🛒 Articles commandés</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 8px; text-align: left;">Produit</th>
                <th style="padding: 8px; text-align: center;">Qté</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #0c5460;">💰 Résumé financier</h3>
          <p><strong>Sous-total:</strong> ${order.subtotal.toFixed(2)}€</p>
          <p><strong>Livraison:</strong> ${order.shipping_cost.toFixed(2)}€</p>
          <p style="font-size: 18px; font-weight: bold; color: #0c5460;"><strong>Total payé:</strong> ${order.total.toFixed(2)}€</p>
        </div>

        <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;"><strong>✅ Statut:</strong> Paiement validé - Commande à traiter</p>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 16px; font-weight: bold;">⚡ Action requise</p>
          <p style="margin: 5px 0 0 0;">Traiter cette commande dans le système de gestion</p>
        </div>

        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          Notification automatique - L'INVISIBLE Admin<br>
          Commande passée le ${new Date(order.created_at).toLocaleString('fr-FR')}
        </p>
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

    console.log(`📧 Envoi notification admin pour commande ${order.order_number}`)
    console.log(`🎯 Admin: ${adminEmail}`)
    console.log(`💰 Montant: ${order.total}€`)
    
    const { data, error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
      to: [adminEmail],
      subject: `🎉 Nouvelle commande payée #${order.order_number} - ${order.total.toFixed(2)}€`,
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

    console.log(`✅ Email admin envoyé avec succès !`)
    console.log(`📨 Email ID: ${data?.id}`)
    console.log(`🛒 Commande: ${order.order_number}`)
    console.log(`👤 Client: ${order.first_name} ${order.last_name}`)
    console.log(`🎯 Admin: ${adminEmail}`)
    
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