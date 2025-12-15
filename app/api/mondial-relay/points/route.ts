import { NextRequest, NextResponse } from 'next/server'
import { MondialRelayClient } from '@/lib/mondial-relay/client'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Début appel API Mondial Relay ===')
    
    // Vérifier les variables d'environnement
    const envVars = {
      CODE_ENSEIGNE: process.env.MONDIAL_RELAY_CODE_ENSEIGNE,
      PRIVATE_KEY: process.env.MONDIAL_RELAY_PRIVATE_KEY,
      PAYS: process.env.MONDIAL_RELAY_PAYS,
      MODE: process.env.MONDIAL_RELAY_MODE
    }
    console.log('Variables d\'environnement:', envVars)

    const body = await request.json()
    const { codePostal, ville, countryCode = 'FR' } = body
    console.log('Paramètres reçus:', { codePostal, ville, countryCode })

    if (!codePostal) {
      console.log('Erreur: Code postal manquant')
      return NextResponse.json(
        { error: 'Code postal requis' },
        { status: 400 }
      )
    }

    if (!envVars.CODE_ENSEIGNE || !envVars.PRIVATE_KEY) {
      console.error('Variables d\'environnement manquantes!')
      return NextResponse.json(
        { error: 'Configuration Mondial Relay manquante' },
        { status: 500 }
      )
    }

    console.log('Création du client Mondial Relay...')
    const client = new MondialRelayClient()
    
    console.log('Appel searchPointsRelais...')
    const result = await client.searchPointsRelais({
      codePostal,
      ville,
      pays: countryCode,
      nbResultats: 10
    })

    console.log('Résultat API:', result)

    if (!result.success) {
      console.error('Erreur retournée par le client:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    console.log('=== Fin appel API Mondial Relay - Succès ===')
    return NextResponse.json({
      success: true,
      points: result.data
    })

  } catch (error) {
    console.error('=== Erreur critique API Mondial Relay ===')
    console.error('Type:', typeof error)
    console.error('Message:', error instanceof Error ? error.message : 'Erreur inconnue')
    console.error('Stack:', error instanceof Error ? error.stack : 'Pas de stack trace')
    
    return NextResponse.json(
      { error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue') },
      { status: 500 }
    )
  }
}