import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email/service'
import { getOrderByNumber, getOrderItems } from '@/lib/api/orders'

export async function POST(request: NextRequest) {
  try {
    const { orderNumber } = await request.json()
    
    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      )
    }

    console.log(`📧 Envoi emails pour commande: ${orderNumber}`)

    // Récupérer la commande et ses items
    const order = await getOrderByNumber(orderNumber)
    if (!order) {
      console.error(`❌ Commande non trouvée: ${orderNumber}`)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderItems = await getOrderItems(order.id)

    // Envoyer l'email de confirmation au client
    try {
      await sendOrderConfirmationEmail({ order, orderItems })
      console.log(`✅ Email confirmation envoyé au client: ${order.email}`)
    } catch (emailError) {
      console.error(`❌ Erreur email client pour ${orderNumber}:`, emailError)
    }

    // Envoyer l'email de notification à l'admin
    try {
      await sendAdminNotificationEmail({ order, orderItems })
      console.log(`✅ Email notification admin envoyé pour commande: ${orderNumber}`)
    } catch (adminEmailError) {
      console.error(`❌ Erreur email admin pour ${orderNumber}:`, adminEmailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur générale envoi emails:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}