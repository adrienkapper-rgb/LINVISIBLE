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

function generateShippingNotificationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande expédiée</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3498db;">📦 Votre commande a été expédiée !</h1>
        
        <p>Bonjour <strong>${order.first_name} ${order.last_name}</strong>,</p>
        
        <p>Bonne nouvelle ! Votre commande <strong>#${order.order_number}</strong> a été expédiée.</p>
        
        <div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Informations de livraison</h4>
          ${order.delivery_type === 'point-relais' ? `
            <p><strong>Point Relais:</strong><br>${order.mondial_relay_point}</p>
            <p>Vous recevrez un SMS/email lorsque votre colis sera disponible en point relais.</p>
          ` : `
            <p><strong>Adresse de livraison:</strong><br>
            ${order.delivery_address}<br>
            ${order.delivery_postal_code} ${order.delivery_city}</p>
            <p>Votre colis sera livré à cette adresse dans 2-3 jours ouvrés.</p>
          `}
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>💡 Conseil :</strong> Gardez votre téléphone à portée de main pour ne pas manquer la livraison !</p>
        </div>
        
        <p>Merci pour votre patience et votre confiance !</p>
        
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
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Parse le body de la requête
    const body: RequestBody = await req.json()
    const { order, orderItems } = body

    // Valider les données requises
    if (!order || !order.email || !order.order_number) {
      return new Response('Missing required order data', { status: 400 })
    }

    // Envoyer l'email
    const { error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [order.email],
      subject: `📦 Votre commande #${order.order_number} a été expédiée`,
      html: generateShippingNotificationTemplate(order, orderItems || []),
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`✅ Email d'expédition envoyé pour commande ${order.order_number}`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Shipping notification email sent successfully' 
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