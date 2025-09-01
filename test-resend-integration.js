// Test de l'intégration Resend avec le nouveau domaine
require('dotenv').config({ path: '.env.local' })
const { Resend } = require('resend')

async function testResendIntegration() {
  console.log('🧪 Test de l\'intégration Resend...\n')
  
  // Vérifier la configuration
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY non trouvée dans .env.local')
    return
  }
  
  console.log('✅ Clé API Resend configurée')
  console.log(`📧 Domaine configuré: cocktails-linvisible.fr\n`)
  
  const resend = new Resend(apiKey)
  
  // Test d'envoi d'email
  try {
    console.log('📤 Envoi d\'un email de test...')
    
    const { data, error } = await resend.emails.send({
      from: 'L\'INVISIBLE <noreply@cocktails-linvisible.fr>',
      to: ['adrienkapper@gmail.com'],
      subject: '🧪 Test intégration Resend - cocktails-linvisible.fr',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Resend</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #27ae60;">🎉 Test réussi !</h1>
            
            <p>L'intégration Resend fonctionne parfaitement avec le domaine <strong>cocktails-linvisible.fr</strong></p>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>✅ Configuration validée :</strong></p>
              <ul>
                <li>Domaine vérifié dans Resend</li>
                <li>DNS configurés dans Vercel</li>
                <li>API Key fonctionnelle</li>
                <li>Envoi d'emails opérationnel</li>
              </ul>
            </div>
            
            <p>Ton système d'emails de confirmation de commande est maintenant opérationnel !</p>
            
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              L'INVISIBLE - Cocktails premium<br>
              Test d'intégration technique
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Erreur lors de l\'envoi:', error)
      return
    }

    console.log('✅ Email envoyé avec succès!')
    console.log(`📧 ID de l'email: ${data?.id}`)
    console.log('📬 Vérifie ta boîte mail: adrienkapper@gmail.com\n')
    
    console.log('🚀 L\'intégration Resend est fonctionnelle!')
    console.log('💡 Tu peux maintenant créer des commandes et recevoir les emails de confirmation.')
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
  }
}

testResendIntegration()
