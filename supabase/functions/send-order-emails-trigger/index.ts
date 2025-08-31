import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface OrderData {
  id: string
  order_number: string
  email: string
  first_name: string
  last_name: string
  phone: string
  status: string
  total: number
  created_at: string
  // ... autres champs de la commande
}

interface OrderItem {
  id: string
  product_name: string
  product_price: number
  quantity: number
  total: number
}

// Configuration Resend
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@linvisible.fr'

async function sendEmailWithResend(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: "L'INVISIBLE <noreply@linvisible.fr>",
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return response.json()
}

function generateOrderConfirmationTemplate(order: OrderData, orderItems: OrderItem[]): string {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.product_price.toFixed(2)}€</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.total.toFixed(2)}€</td>
    </tr>
  `).join('')

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Confirmation de commande</h1>
      <p>Bonjour ${order.first_name} ${order.last_name},</p>
      <p>Merci pour votre commande ! Voici le récapitulatif :</p>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>Commande #${order.order_number}</h3>
        <p><strong>Date :</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
        <p><strong>Statut :</strong> ${order.status}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f5f5f5;">
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

      <div style="text-align: right; margin: 20px 0;">
        <h3>Total : ${order.total.toFixed(2)}€</h3>
      </div>

      <p>Nous vous tiendrons informé(e) de l'avancement de votre commande.</p>
      <p>Merci de votre confiance !</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px; text-align: center;">
        L'INVISIBLE - Email automatique, ne pas répondre
      </p>
    </div>
  `
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    const order: OrderData = record

    console.log(`📧 Déclenchement emails pour commande: ${order.order_number}`)

    // Récupérer les items de la commande depuis Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (error) {
      console.error('Erreur récupération order_items:', error)
      throw error
    }

    // Envoyer email de confirmation au client
    try {
      const confirmationHtml = generateOrderConfirmationTemplate(order, orderItems || [])
      await sendEmailWithResend(
        order.email,
        `Confirmation de commande #${order.order_number}`,
        confirmationHtml
      )
      console.log(`✅ Email confirmation envoyé à: ${order.email}`)
    } catch (emailError) {
      console.error('❌ Erreur email client:', emailError)
    }

    // Envoyer notification à l'admin
    try {
      const adminHtml = `
        <h2>Nouvelle commande reçue</h2>
        <p><strong>Commande:</strong> #${order.order_number}</p>
        <p><strong>Client:</strong> ${order.first_name} ${order.last_name} (${order.email})</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}€</p>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
      `
      
      await sendEmailWithResend(
        ADMIN_EMAIL,
        `Nouvelle commande #${order.order_number}`,
        adminHtml
      )
      console.log(`✅ Notification admin envoyée à: ${ADMIN_EMAIL}`)
    } catch (adminError) {
      console.error('❌ Erreur email admin:', adminError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})