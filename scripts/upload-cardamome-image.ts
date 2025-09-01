import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadCardamomeImage() {
  console.log('📷 Upload de l\'image Cardamome vers Supabase...')
  
  try {
    // Chemin vers l'image source
    const sourceImagePath = join('C:', 'Users', 'Admin', 'Desktop', 'LINVISIBLE', 'sources', 'N°06 - Cardamome copie.jpg')
    
    // Nom nettoyé pour Supabase
    const cleanFileName = 'n06-cardamome.jpg'
    
    console.log(`📁 Lecture de l'image depuis: ${sourceImagePath}`)
    
    // Lire le fichier
    const fileBuffer = readFileSync(sourceImagePath)
    
    console.log(`⬆️ Upload vers Supabase Storage avec le nom: ${cleanFileName}`)
    
    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(cleanFileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true // Remplace l'image si elle existe déjà
      })
    
    if (uploadError) {
      console.error('❌ Erreur lors de l\'upload:', uploadError)
      return
    }
    
    console.log('✅ Image uploadée avec succès')
    
    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(cleanFileName)
    
    const publicUrl = urlData.publicUrl
    console.log(`🔗 URL publique: ${publicUrl}`)
    
    // Mettre à jour le produit dans la base de données
    console.log('📝 Mise à jour du produit Cardamome...')
    
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ 
        image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', '584f1997-dbe2-4ac0-bba4-2e932216087c')
      .select()
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du produit:', updateError)
      return
    }
    
    console.log('✅ Produit mis à jour avec succès')
    console.log('🎉 Migration de l\'image Cardamome terminée!')
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
  }
}

// Exécuter le script
uploadCardamomeImage()