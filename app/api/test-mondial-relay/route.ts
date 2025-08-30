import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Variables d'environnement
    const envVars = {
      CODE_ENSEIGNE: process.env.MONDIAL_RELAY_CODE_ENSEIGNE,
      PRIVATE_KEY: process.env.MONDIAL_RELAY_PRIVATE_KEY,
      PAYS: process.env.MONDIAL_RELAY_PAYS,
      MODE: process.env.MONDIAL_RELAY_MODE
    }

    // Test 2: Import du client
    let clientError = null
    try {
      const { MondialRelayClient } = await import('@/lib/mondial-relay/client')
      const client = new MondialRelayClient()
    } catch (error) {
      clientError = error instanceof Error ? error.message : 'Erreur import client'
    }

    return NextResponse.json({
      success: true,
      envVars,
      clientError,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}