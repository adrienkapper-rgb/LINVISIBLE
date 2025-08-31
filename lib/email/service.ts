import { Resend } from 'resend'
import { Order, OrderItem } from '@/lib/api/orders'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in environment variables')
  }
  return new Resend(apiKey)
}

export interface EmailData {
  order: Order
  orderItems?: OrderItem[]
}

export async function sendOrderConfirmationEmail(data: EmailData) {
  const { order, orderItems = [] } = data
  const resend = getResendClient()
  
  // FORCER L'ENVOI VERS adrienkapper@gmail.com pour tests
  const targetEmail = 'adrienkapper@gmail.com'
  
  try {
    await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [targetEmail],
      subject: `Confirmation de commande #${order.order_number}`,
      html: generateOrderConfirmationTemplate(order, orderItems),
    })
    
    console.log(`✅ Email de confirmation envoyé pour commande ${order.order_number} vers ${targetEmail}`)
  } catch (error) {
    console.error(`❌ Erreur envoi email confirmation commande ${order.order_number}:`, error)
    throw error
  }
}

export async function sendPaymentConfirmationEmail(data: EmailData) {
  const { order, orderItems = [] } = data
  const resend = getResendClient()
  
  try {
    await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [order.email],
      subject: `Paiement confirmé - Commande #${order.order_number}`,
      html: generatePaymentConfirmationTemplate(order, orderItems),
    })
    
    console.log(`✅ Email de confirmation paiement envoyé pour commande ${order.order_number}`)
  } catch (error) {
    console.error(`❌ Erreur envoi email confirmation paiement commande ${order.order_number}:`, error)
    throw error
  }
}

export async function sendAdminNotificationEmail(data: EmailData) {
  const { order, orderItems = [] } = data
  // FORCER L'ENVOI VERS adrienkapper@gmail.com pour tests
  const adminEmail = 'adrienkapper@gmail.com'
  const resend = getResendClient()
  
  try {
    await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [adminEmail],
      subject: `🔔 Nouvelle commande payée #${order.order_number}`,
      html: generateAdminNotificationTemplate(order, orderItems),
    })
    
    console.log(`✅ Email admin envoyé pour commande ${order.order_number} vers ${adminEmail}`)
  } catch (error) {
    console.error(`❌ Erreur envoi email admin commande ${order.order_number}:`, error)
    throw error
  }
}

export async function sendShippingNotificationEmail(data: EmailData) {
  const { order, orderItems = [] } = data
  const resend = getResendClient()
  
  try {
    await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [order.email],
      subject: `📦 Votre commande #${order.order_number} a été expédiée`,
      html: generateShippingNotificationTemplate(order, orderItems),
    })
    
    console.log(`✅ Email d'expédition envoyé pour commande ${order.order_number}`)
  } catch (error) {
    console.error(`❌ Erreur envoi email expédition commande ${order.order_number}:`, error)
    throw error
  }
}

export async function sendDeliveryNotificationEmail(data: EmailData) {
  const { order, orderItems = [] } = data
  const resend = getResendClient()
  
  try {
    await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@linvisible.fr>',
      to: [order.email],
      subject: `🎉 Votre commande #${order.order_number} est arrivée`,
      html: generateDeliveryNotificationTemplate(order, orderItems),
    })
    
    console.log(`✅ Email de livraison envoyé pour commande ${order.order_number}`)
  } catch (error) {
    console.error(`❌ Erreur envoi email livraison commande ${order.order_number}:`, error)
    throw error
  }
}

// Templates HTML
function generateOrderConfirmationTemplate(order: Order, orderItems: OrderItem[]): string {
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

function generatePaymentConfirmationTemplate(order: Order, orderItems: OrderItem[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Paiement confirmé</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #27ae60;">✅ Paiement confirmé !</h1>
        
        <p>Bonjour <strong>${order.first_name} ${order.last_name}</strong>,</p>
        
        <p>Nous confirmons que votre paiement pour la commande <strong>#${order.order_number}</strong> a bien été reçu.</p>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💰 Montant payé: ${order.total.toFixed(2)}€</strong></p>
        </div>
        
        <p>Votre commande est maintenant en cours de préparation. Nous vous tiendrons informé de l'avancement de votre livraison.</p>
        
        <p>Merci pour votre achat !</p>
        
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

function generateAdminNotificationTemplate(order: Order, orderItems: OrderItem[]): string {
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
      </div>
    </body>
    </html>
  `
}

function generateShippingNotificationTemplate(order: Order, orderItems: OrderItem[]): string {
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

function generateDeliveryNotificationTemplate(order: Order, orderItems: OrderItem[]): string {
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
          <p style="margin: 0;"><strong>🥂 Il est temps de déguster vos cocktails L'INVISIBLE !</strong></p>
        </div>
        
        <p>Nous espérons que vous apprécierez vos cocktails. N'hésitez pas à partager votre expérience avec nous !</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Conseils de dégustation:</strong></p>
          <ul>
            <li>Servir bien frais (6-8°C)</li>
            <li>Agiter avant de servir</li>
            <li>Déguster avec modération</li>
          </ul>
        </div>
        
        <p>Merci pour votre confiance et à bientôt pour de nouveaux cocktails !</p>
        
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