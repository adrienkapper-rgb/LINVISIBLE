import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...'
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  return NextResponse.json({
    message: 'Webhook debug - POST received',
    timestamp: new Date().toISOString(),
    data: {
      bodyLength: body.length,
      hasSignature: !!signature,
      signaturePrefix: signature?.substring(0, 20) + '...',
      headers: Object.fromEntries(request.headers.entries())
    }
  })
}