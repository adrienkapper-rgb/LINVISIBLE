import { NextRequest, NextResponse } from 'next/server'
import { MondialRelayClient } from '@/lib/mondial-relay/client'

export async function GET(request: NextRequest) {
  try {
    console.log('Test direct de l\'API Mondial Relay')
    
    const client = new MondialRelayClient()
    
    const result = await client.searchPointsRelais({
      codePostal: '33000',
      ville: 'Bordeaux',
      nbResultats: 5
    })

    console.log('Résultat complet:', JSON.stringify(result, null, 2))

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Erreur test API:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}