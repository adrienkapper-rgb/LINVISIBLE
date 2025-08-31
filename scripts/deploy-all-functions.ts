// Script pour déployer toutes les Edge Functions avec le bon domaine
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const functions = [
  {
    name: 'send-payment-confirmation',
    code: `import { Resend } from 'npm:resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

interface OrderData {
  id: string
  order_number: string
  email: string
  first_name: string
  last_name: string
  total: number
}

interface RequestBody {
  order: OrderData
  orderItems: any[]
}

function generatePaymentConfirmationTemplate(order: OrderData): string {
  return \`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Paiement confirmé</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #27ae60;">✅ Paiement confirmé !</h1>
        
        <p>Bonjour <strong>\${order.first_name} \${order.last_name}</strong>,</p>
        
        <p>Nous confirmons que votre paiement pour la commande <strong>#\${order.order_number}</strong> a bien été reçu.</p>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💰 Montant payé: \${order.total.toFixed(2)}€</strong></p>
        </div>
        
        <p>Votre commande est maintenant en cours de préparation. Nous vous tiendrons informé de l'avancement de votre livraison.</p>
        
        <p>Merci pour votre achat !</p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          L'INVISIBLE - Cocktails premium<br>
          En cas de question, contactez-nous à adrienkapper@gmail.com
        </p>
      </div>
    </body>
    </html>
  \`
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: RequestBody = await req.json()
    const { order } = body

    if (!order || !order.email || !order.order_number) {
      return new Response('Missing required order data', { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'L\\'INVISIBLE <onboarding@resend.dev>',
      to: [order.email],
      subject: \`Paiement confirmé - Commande #\${order.order_number}\`,
      html: generatePaymentConfirmationTemplate(order),
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(\`✅ Email de confirmation paiement envoyé pour commande \${order.order_number}\`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment confirmation email sent successfully' 
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
})`
  }
]

console.log('Déploiement des Edge Functions...')
// Pour l'instant, on va juste tester la première fonction
// Les autres peuvent être déployées manuellement si nécessaire