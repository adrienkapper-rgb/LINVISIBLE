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

function generateAdminNotificationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  const itemsList = orderItems.map(item => 
    `• ${item.product_name} x${item.quantity} - ${item.total.toFixed(2)}€`
  ).join('<br>')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle commande</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e74c3c;">🔔 Nouvelle commande payée</h1>
        
        <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Commande #${order.order_number}</h3>
          <p><strong>Client:</strong> ${order.first_name} ${order.last_name}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Téléphone:</strong> ${order.phone}</p>
          <p><strong>Total:</strong> ${order.total.toFixed(2)}€</p>
        </div>
        
        <h4>Produits commandés:</h4>
        <p>${itemsList}</p>
        
        <h4>Livraison:</h4>
        ${order.delivery_type === 'point-relais' ? `
          <p><strong>Type:</strong> Point Relais<br>
          <strong>Point:</strong> ${order.mondial_relay_point}</p>
        ` : `
          <p><strong>Type:</strong> À domicile<br>
          <strong>Adresse:</strong><br>
          ${order.delivery_address}<br>
          ${order.delivery_postal_code} ${order.delivery_city}<br>
          ${order.delivery_country}</p>
        `}
        
        <p style="margin-top: 20px;">
          <strong>Action requise:</strong> Préparer et expédier la commande
        </p>
        
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date de commande:</strong> ${new Date(order.created_at).toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

Deno.serve(async (req: Request) => {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Parse le body de la requête
    const body: RequestBody = await req.json()
    const { order, orderItems } = body

    // Valider les données requises
    if (!order || !order.order_number) {
      return new Response('Missing required order data', { status: 400 })
    }

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@linvisible.fr'

    // Envoyer l'email
    const { error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [adminEmail],
      subject: `🔔 Nouvelle commande payée #${order.order_number}`,
      html: generateAdminNotificationTemplate(order, orderItems || []),
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`✅ Email admin envoyé pour commande ${order.order_number}`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin notification email sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erreur dans Edge Function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})