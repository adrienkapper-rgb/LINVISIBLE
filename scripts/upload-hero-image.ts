import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadHeroImage() {
  console.log('📷 Upload de l\'image hero vers Supabase...')
  
  const publicDir = join(process.cwd(), 'public')
  const fileName = 'hero-image.png'
  const cleanFileName = 'hero-image.png'
  
  try {
    console.log(`Uploading ${fileName}...`)
    
    const filePath = join(publicDir, fileName)
    const fileBuffer = readFileSync(filePath)
    
    // Upload vers le bucket product-images existant
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(cleanFileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      })
    
    if (error) {
      console.error(`Error uploading ${fileName}:`, error)
      return
    }
    
    console.log(`✅ ${fileName} uploaded as ${cleanFileName}`)
    
    // Récupérer l'URL publique
    const { data: publicUrlData } = await supabase.storage
      .from('product-images')
      .getPublicUrl(cleanFileName)
    
    console.log(`🌐 URL publique: ${publicUrlData.publicUrl}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

uploadHeroImage()