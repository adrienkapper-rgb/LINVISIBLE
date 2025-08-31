import { config } from 'dotenv'

// Charger les variables d'environnement
config({ path: '.env.local' })

const RESEND_API_KEY = 're_CM629xWr_CfLWDFbxqdnzC6PuzfFRboN2'

async function testResendDirect() {
  console.log('🧪 Test direct de l\'API Resend')
  console.log('API Key:', RESEND_API_KEY ? RESEND_API_KEY.slice(0, 10) + '...' : 'NON DÉFINIE')
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['adrienkapper@gmail.com'],
        subject: 'Test direct API Resend',
        html: '<h1>Test réussi !</h1><p>L\'API Resend fonctionne correctement avec le domaine par défaut.</p>'
      })
    })

    const data = await response.text()
    
    console.log('Status:', response.status)
    console.log('Response:', data)
    
    if (response.ok) {
      console.log('✅ Test API Resend réussi !')
    } else {
      console.log('❌ Test API Resend échoué')
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testResendDirect().catch(console.error)