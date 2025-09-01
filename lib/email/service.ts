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
  
  try {
    await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
      to: [order.email],
      subject: `Confirmation de commande #${order.order_number}`,
      html: generateOrderConfirmationTemplate(order, orderItems),
    })
    
    console.log(`✅ Email de confirmation envoyé pour commande ${order.order_number} vers ${order.email}`)
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
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
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
  // Email admin pour les notifications
  const adminEmail = 'adrienkapper@gmail.com'
  const resend = getResendClient()
  
  try {
    await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
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
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
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
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
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
      <td style="padding: 12px; border-bottom: 1px solid #C4B5A0; font-family: 'Inter', Arial, sans-serif; color: #171717;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #C4B5A0; text-align: center; font-family: 'Inter', Arial, sans-serif; color: #171717;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #C4B5A0; text-align: right; font-family: 'Inter', Arial, sans-serif; color: #171717;">${item.product_price.toFixed(2)}€</td>
      <td style="padding: 12px; border-bottom: 1px solid #C4B5A0; text-align: right; font-weight: 600; font-family: 'Inter', Arial, sans-serif; color: #171717;">${item.total.toFixed(2)}€</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de commande</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5F1ED; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #171717;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header avec logo/titre -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: #171717; margin: 0; letter-spacing: 2px;">L'INVISIBLE</h1>
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">Éditeur de cocktails</p>
        </div>
        
        <!-- Contenu principal -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          
          <!-- Salutation -->
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif; color: #171717;">
            Bonjour ${order.first_name} ${order.last_name}
          </p>
          
          <p style="font-size: 14px; margin: 0 0 30px 0; font-family: 'Inter', Arial, sans-serif; color: #171717;">
            Merci pour votre commande
          </p>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Nous avons bien reçu votre commande <strong style="color: #171717;">#${order.order_number}</strong>.</p>
          
          <!-- Détails de la commande -->
          <div style="background: #FAF8F6; border: 1px solid #E8E2DB; padding: 24px; border-radius: 6px; margin: 30px 0;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 20px; color: #171717; margin: 0 0 20px 0;">Détails de la commande</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #F5F1ED; border-bottom: 2px solid #C4B5A0;">
                  <th style="padding: 12px; text-align: left; font-family: 'Inter', Arial, sans-serif; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">Produit</th>
                  <th style="padding: 12px; text-align: center; font-family: 'Inter', Arial, sans-serif; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">Qté</th>
                  <th style="padding: 12px; text-align: right; font-family: 'Inter', Arial, sans-serif; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">Prix unit.</th>
                  <th style="padding: 12px; text-align: right; font-family: 'Inter', Arial, sans-serif; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #C4B5A0;">
              <table style="width: 100%;">
                <tr>
                  <td style="text-align: right; padding: 6px; font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Sous-total:</td>
                  <td style="text-align: right; padding: 6px; width: 120px; font-family: 'Inter', Arial, sans-serif; color: #171717; font-weight: 500;">${order.subtotal.toFixed(2)}€</td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 6px; font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Livraison:</td>
                  <td style="text-align: right; padding: 6px; font-family: 'Inter', Arial, sans-serif; color: #171717; font-weight: 500;">${order.shipping_cost.toFixed(2)}€</td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 12px 6px; border-top: 1px solid #E8E2DB; font-family: 'Playfair Display', serif; font-size: 18px; color: #171717;">Total:</td>
                  <td style="text-align: right; padding: 12px 6px; border-top: 1px solid #E8E2DB; font-family: 'Inter', Arial, sans-serif; font-size: 20px; font-weight: 700; color: #171717;">${order.total.toFixed(2)}€</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Informations de livraison -->
          <div style="background: #FAF8F6; border: 1px solid #E8E2DB; padding: 24px; border-radius: 6px; margin: 30px 0;">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 18px; color: #171717; margin: 0 0 16px 0;">Informations de livraison</h4>
            ${order.delivery_type === 'point-relais' ? `
              <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B; margin: 0;"><span style="font-weight: 600; color: #171717;">Point Relais:</span><br>${order.mondial_relay_point || 'À confirmer'}</p>
            ` : `
              <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B; margin: 0;"><span style="font-weight: 600; color: #171717;">Adresse de livraison:</span><br>
              ${order.delivery_address}<br>
              ${order.delivery_postal_code} ${order.delivery_city}<br>
              ${order.delivery_country}</p>
            `}
          </div>

          <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B; line-height: 1.6;">Votre commande sera traitée dans les plus brefs délais. Vous recevrez une confirmation de paiement ainsi qu'un suivi de livraison par email.</p>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #171717; font-weight: 500; margin-top: 30px;">Merci de votre confiance !</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E2DB;">
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin: 0;">
            L'INVISIBLE - Éditeur de cocktails artisanaux<br>
            <a href="mailto:contact@cocktails-linvisible.fr" style="color: #171717; text-decoration: none;">contact@cocktails-linvisible.fr</a>
          </p>
        </div>
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5F1ED; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #171717;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header avec logo/titre -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: #171717; margin: 0; letter-spacing: 2px;">L'INVISIBLE</h1>
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">Éditeur de cocktails</p>
        </div>
        
        <!-- Contenu principal -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          
          <!-- Salutation -->
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif; color: #171717;">
            Bonjour ${order.first_name} ${order.last_name}
          </p>
          
          <p style="font-size: 14px; margin: 0 0 30px 0; font-family: 'Inter', Arial, sans-serif; color: #27ae60; font-weight: 600;">
            ✅ Paiement confirmé !
          </p>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Nous confirmons que votre paiement pour la commande <strong style="color: #171717;">#${order.order_number}</strong> a bien été reçu.</p>
          
          <div style="background: #F0F8F4; border: 1px solid #C3E6CB; padding: 20px; border-radius: 6px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #27ae60;">Montant payé: ${order.total.toFixed(2)}€</p>
          </div>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Votre commande est maintenant en cours de préparation. Nous vous tiendrons informé de l'avancement de votre livraison.</p>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #171717; font-weight: 500; margin-top: 30px;">Merci pour votre achat !</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E2DB;">
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin: 0;">
            L'INVISIBLE - Éditeur de cocktails artisanaux<br>
            <a href="mailto:contact@cocktails-linvisible.fr" style="color: #171717; text-decoration: none;">contact@cocktails-linvisible.fr</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateAdminNotificationTemplate(order: Order, orderItems: OrderItem[]): string {
  const itemsList = orderItems.map(item => 
    `<div style="padding: 8px 0; border-bottom: 1px solid #E8E2DB; font-family: 'Inter', Arial, sans-serif;">
      <span style="font-weight: 500; color: #171717;">${item.product_name}</span> 
      <span style="color: #6B6B6B;">x${item.quantity}</span> - 
      <span style="font-weight: 600; color: #171717;">${item.total.toFixed(2)}€</span>
    </div>`
  ).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle commande</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5F1ED; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #171717;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header avec logo/titre -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: #171717; margin: 0; letter-spacing: 2px;">L'INVISIBLE</h1>
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">Administration</p>
        </div>
        
        <!-- Contenu principal -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          
          <div style="background: #FFF3CD; border: 1px solid #FFE69C; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; color: #856404; margin: 0 0 8px 0;">🔔 Nouvelle commande payée</h2>
            <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B; margin: 0;">Une nouvelle commande vient d'être finalisée.</p>
          </div>
          
          <!-- Infos commande -->
          <div style="background: #FAF8F6; border: 1px solid #E8E2DB; padding: 24px; border-radius: 6px; margin: 24px 0;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 20px; color: #171717; margin: 0 0 16px 0;">Commande #${order.order_number}</h3>
            <div style="display: grid; gap: 8px;">
              <p style="font-family: 'Inter', Arial, sans-serif; margin: 0; color: #6B6B6B;"><span style="font-weight: 600; color: #171717;">Client:</span> ${order.first_name} ${order.last_name}</p>
              <p style="font-family: 'Inter', Arial, sans-serif; margin: 0; color: #6B6B6B;"><span style="font-weight: 600; color: #171717;">Email:</span> <a href="mailto:${order.email}" style="color: #171717; text-decoration: none;">${order.email}</a></p>
              <p style="font-family: 'Inter', Arial, sans-serif; margin: 0; color: #6B6B6B;"><span style="font-weight: 600; color: #171717;">Téléphone:</span> ${order.phone}</p>
              <p style="font-family: 'Inter', Arial, sans-serif; margin: 0; color: #6B6B6B;"><span style="font-weight: 600; color: #171717;">Total:</span> <span style="font-size: 18px; font-weight: 700; color: #171717;">${order.total.toFixed(2)}€</span></p>
            </div>
          </div>
          
          <!-- Produits commandés -->
          <div style="margin: 24px 0;">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 18px; color: #171717; margin: 0 0 16px 0;">Produits commandés</h4>
            <div style="background: #FAF8F6; border: 1px solid #E8E2DB; padding: 16px; border-radius: 6px;">
              ${itemsList}
            </div>
          </div>
          
          <!-- Livraison -->
          <div style="margin: 24px 0;">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 18px; color: #171717; margin: 0 0 16px 0;">Livraison</h4>
            <div style="background: #FAF8F6; border: 1px solid #E8E2DB; padding: 20px; border-radius: 6px;">
              ${order.delivery_type === 'point-relais' ? `
                <p style="font-family: 'Inter', Arial, sans-serif; margin: 0; color: #6B6B6B;"><span style="font-weight: 600; color: #171717;">Type:</span> Point Relais</p>
                <p style="font-family: 'Inter', Arial, sans-serif; margin: 8px 0 0 0; color: #6B6B6B;"><span style="font-weight: 600; color: #171717;">Point:</span> ${order.mondial_relay_point}</p>
              ` : `
                <p style="font-family: 'Inter', Arial, sans-serif; margin: 0; color: #6B6B6B;"><span style="font-weight: 600; color: #171717;">Type:</span> À domicile</p>
                <div style="margin-top: 8px; font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">
                  <span style="font-weight: 600; color: #171717;">Adresse:</span><br>
                  ${order.delivery_address}<br>
                  ${order.delivery_postal_code} ${order.delivery_city}<br>
                  ${order.delivery_country}
                </div>
              `}
            </div>
          </div>
          
          <!-- Action requise -->
          <div style="background: #FFF3CD; border: 1px solid #FFE69C; padding: 20px; border-radius: 6px; text-align: center; margin-top: 30px;">
            <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-weight: 600; color: #856404;">⚡ Action requise: Préparer et expédier la commande</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E2DB;">
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin: 0;">
            L'INVISIBLE - Système de gestion des commandes
          </p>
        </div>
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5F1ED; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #171717;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header avec logo/titre -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: #171717; margin: 0; letter-spacing: 2px;">L'INVISIBLE</h1>
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">Éditeur de cocktails</p>
        </div>
        
        <!-- Contenu principal -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          
          <!-- Salutation -->
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif; color: #171717;">
            Bonjour ${order.first_name} ${order.last_name}
          </p>
          
          <p style="font-size: 14px; margin: 0 0 30px 0; font-family: 'Inter', Arial, sans-serif; color: #3498db; font-weight: 600;">
            📦 Votre commande a été expédiée !
          </p>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Bonne nouvelle ! Votre commande <strong style="color: #171717;">#${order.order_number}</strong> a été expédiée.</p>
          
          <!-- Informations de livraison -->
          <div style="background: #E3F2FD; border: 1px solid #BBDEFB; padding: 24px; border-radius: 6px; margin: 30px 0;">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 18px; color: #171717; margin: 0 0 16px 0;">Informations de livraison</h4>
            ${order.delivery_type === 'point-relais' ? `
              <div style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">
                <p style="margin: 0 0 12px 0;"><span style="font-weight: 600; color: #171717;">Point Relais:</span><br>${order.mondial_relay_point}</p>
                <p style="margin: 0; font-style: italic;">Vous recevrez un SMS/email lorsque votre colis sera disponible en point relais.</p>
              </div>
            ` : `
              <div style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">
                <p style="margin: 0 0 12px 0;"><span style="font-weight: 600; color: #171717;">Adresse de livraison:</span><br>
                ${order.delivery_address}<br>
                ${order.delivery_postal_code} ${order.delivery_city}</p>
                <p style="margin: 0; font-style: italic;">Votre colis sera livré à cette adresse dans 2-3 jours ouvrés.</p>
              </div>
            `}
          </div>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #171717; font-weight: 500; margin-top: 30px;">Merci pour votre patience et votre confiance !</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E2DB;">
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin: 0;">
            L'INVISIBLE - Éditeur de cocktails artisanaux<br>
            <a href="mailto:contact@cocktails-linvisible.fr" style="color: #171717; text-decoration: none;">contact@cocktails-linvisible.fr</a>
          </p>
        </div>
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5F1ED; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #171717;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header avec logo/titre -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: #171717; margin: 0; letter-spacing: 2px;">L'INVISIBLE</h1>
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">Éditeur de cocktails</p>
        </div>
        
        <!-- Contenu principal -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          
          <!-- Salutation -->
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif; color: #171717;">
            Bonjour ${order.first_name} ${order.last_name}
          </p>
          
          <p style="font-size: 14px; margin: 0 0 30px 0; font-family: 'Inter', Arial, sans-serif; color: #27ae60; font-weight: 600;">
            🎉 Votre commande est arrivée !
          </p>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Excellente nouvelle ! Votre commande <strong style="color: #171717;">#${order.order_number}</strong> a été livrée avec succès.</p>
          
          <div style="background: #D4EDDA; border: 1px solid #C3E6CB; padding: 24px; border-radius: 6px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; color: #27ae60;">🥂 Il est temps de déguster vos cocktails L'INVISIBLE !</p>
          </div>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B;">Nous espérons que vous apprécierez vos cocktails. N'hésitez pas à partager votre expérience avec nous !</p>
          
          <div style="background: #FAF8F6; border: 1px solid #E8E2DB; padding: 24px; border-radius: 6px; margin: 30px 0;">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 16px; color: #171717; margin: 0 0 16px 0;">Conseils de dégustation</h4>
            <ul style="font-family: 'Inter', Arial, sans-serif; color: #6B6B6B; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Servir bien frais (6-8°C)</li>
              <li>Agiter avant de servir</li>
              <li>Déguster avec modération</li>
            </ul>
          </div>
          
          <p style="font-family: 'Inter', Arial, sans-serif; color: #171717; font-weight: 500; margin-top: 30px;">Merci pour votre confiance et à bientôt pour de nouveaux cocktails !</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E2DB;">
          <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6B6B6B; margin: 0;">
            L'INVISIBLE - Éditeur de cocktails artisanaux<br>
            <a href="mailto:contact@cocktails-linvisible.fr" style="color: #171717; text-decoration: none;">contact@cocktails-linvisible.fr</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}