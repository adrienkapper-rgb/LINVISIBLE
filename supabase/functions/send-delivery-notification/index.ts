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

function generateDeliveryNotificationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande livrée</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #27ae60;">🎉 Votre commande est arrivée !</h1>
        
        <p>Bonjour <strong>${order.first_name} ${order.last_name}</strong>,</p>
        
        <p>Excellente nouvelle ! Votre commande <strong>#${order.order_number}</strong> a été livrée avec succès.</p>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; text-align: center; font-size: 18px;">
            <strong>🥂 Il est temps de déguster vos cocktails L'INVISIBLE !</strong>
          </p>
        </div>
        
        <p>Nous espérons que vous apprécierez vos cocktails. N'hésitez pas à partager votre expérience avec nous !</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #495057; margin-top: 0;">🍸 Conseils de dégustation :</h4>
          <ul style="color: #6c757d;">
            <li>Servir bien frais (6-8°C)</li>
            <li>Agiter avant de servir</li>
            <li>Déguster avec modération</li>
            <li>Parfait pour vos soirées entre amis !</li>
          </ul>
        </div>
        
        <div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #1976d2; margin-top: 0;">💬 Partagez votre expérience</h4>
          <p style="margin-bottom: 0;">Vous avez aimé nos cocktails ? Partagez votre avis sur nos réseaux sociaux ou laissez-nous un commentaire !</p>
        </div>
        
        <p>Merci pour votre confiance et à bientôt pour de nouveaux cocktails !</p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          L'INVISIBLE - Cocktails premium<br>
          En cas de question, contactez-nous à contact@linvisible.fr<br>
          <em>La consommation d'alcool est dangereuse pour la santé, consommez avec modération.</em>
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
      subject: `🎉 Votre commande #${order.order_number} est arrivée`,
      html: generateDeliveryNotificationTemplate(order, orderItems || []),
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`✅ Email de livraison envoyé pour commande ${order.order_number}`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Delivery notification email sent successfully' 
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