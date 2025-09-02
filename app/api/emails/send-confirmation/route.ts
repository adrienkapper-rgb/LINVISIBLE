import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

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

function generateOrderConfirmationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.product_price.toFixed(2)}€</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.total.toFixed(2)}€</td>
    </tr>
  `).join('')

  const deliveryInfoHtml = order.delivery_type === 'point-relais' ? `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; color: #1976d2;">📦 Informations de livraison</h4>
      <p style="margin: 0;"><strong>Point Relais:</strong> ${order.mondial_relay_point || 'À confirmer'}</p>
    </div>
  ` : `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; color: #1976d2;">🏠 Informations de livraison</h4>
      <p style="margin: 5px 0;"><strong>Adresse:</strong><br>
      ${order.delivery_address}<br>
      ${order.delivery_postal_code} ${order.delivery_city}<br>
      ${order.delivery_country}</p>
    </div>
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✅ Commande confirmée !</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Merci pour votre confiance</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 18px; margin: 0 0 20px 0;">Bonjour <strong>${order.first_name} ${order.last_name}</strong>,</p>
          
          <p style="margin: 0 0 25px 0;">Nous avons bien reçu votre commande <strong style="color: #1976d2;">#${order.order_number}</strong> et votre paiement a été validé avec succès.</p>
          
          <!-- Order Details -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 20px 0; color: #1976d2;">📋 Détails de la commande</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #e9ecef;">
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Produit</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600;">Quantité</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Prix unitaire</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #1976d2;">
              <table style="width: 100%;">
                <tr>
                  <td style="text-align: right; padding: 5px; font-size: 16px;"><strong>Sous-total:</strong></td>
                  <td style="text-align: right; padding: 5px; width: 120px; font-size: 16px;">${order.subtotal.toFixed(2)}€</td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 5px; font-size: 16px;"><strong>Livraison:</strong></td>
                  <td style="text-align: right; padding: 5px; font-size: 16px;">${order.shipping_cost.toFixed(2)}€</td>
                </tr>
                <tr style="background: #e3f2fd;">
                  <td style="text-align: right; padding: 12px; font-size: 20px; font-weight: bold; color: #1976d2;"><strong>Total:</strong></td>
                  <td style="text-align: right; padding: 12px; font-size: 20px; font-weight: bold; color: #1976d2;">${order.total.toFixed(2)}€</td>
                </tr>
              </table>
            </div>
          </div>

          ${deliveryInfoHtml}

          <!-- Status -->
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;"><strong>✅ Statut:</strong> Commande confirmée et paiement validé</p>
          </div>

          <p style="margin: 25px 0;">Votre commande sera traitée dans les plus brefs délais. Vous recevrez un email de suivi de livraison dès l'expédition.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0; color: #666;">Besoin d'aide ? Contactez-nous à <a href="mailto:contact@cocktails-linvisible.fr" style="color: #1976d2;">contact@cocktails-linvisible.fr</a></p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>L'INVISIBLE</strong> - Cocktails premium<br>
            Merci de votre confiance ! 🍸
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé API secrète
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      console.error('❌ Unauthorized: Invalid API key')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: RequestBody = await request.json()
    const { order, orderItems } = body

    // Validate required data
    if (!order || !order.email || !order.order_number) {
      console.error('❌ Données de commande manquantes')
      return NextResponse.json(
        { error: 'Missing required order data' },
        { status: 400 }
      )
    }

    console.log(`📧 Envoi email de confirmation pour commande ${order.order_number}`)
    console.log(`🎯 Destinataire: ${order.email}`)
    console.log(`👤 Client: ${order.first_name} ${order.last_name}`)
    
    const { data, error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
      to: [order.email],
      subject: `✅ Commande confirmée #${order.order_number} - L'INVISIBLE`,
      html: generateOrderConfirmationTemplate(order, orderItems || []),
    })

    if (error) {
      console.error('❌ Erreur envoi email:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to send email',
          details: error.message,
          orderNumber: order.order_number
        },
        { status: 500 }
      )
    }

    console.log(`✅ Email de confirmation envoyé avec succès !`)
    console.log(`📨 Email ID: ${data?.id}`)
    console.log(`🛒 Commande: ${order.order_number}`)
    console.log(`👤 Client: ${order.first_name} ${order.last_name} (${order.email})`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order confirmation email sent successfully',
      data: {
        emailId: data?.id,
        orderNumber: order.order_number,
        targetEmail: order.email
      }
    })

  } catch (error) {
    console.error('❌ Erreur générale dans send-confirmation:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}