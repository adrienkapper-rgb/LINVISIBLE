import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function uploadHeroImage() {
  try {
    console.log('🔄 Reading image file...')

    // Read the image file
    const imagePath = join(process.cwd(), 'public', '6-bouteilles.jpg')
    const imageBuffer = readFileSync(imagePath)

    console.log(`✅ Image loaded: ${imageBuffer.length} bytes`)
    console.log('🔄 Uploading to Supabase storage...')

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `hero-6-bouteilles-${timestamp}.jpg`

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filename, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`)
    }

    console.log('✅ Image uploaded successfully')
    console.log(`📁 File path: ${uploadData.path}`)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)

    console.log(`🌐 Public URL: ${publicUrl}`)
    console.log('🔄 Updating interface settings in database...')

    // Update interface_settings table
    const { data: updateData, error: updateError } = await supabase
      .from('interface_settings')
      .update({
        hero_image_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`)
    }

    console.log('✅ Database updated successfully')
    console.log('🎉 Hero image "6 bouteilles.jpg" has been set as the new hero image!')
    console.log('\n📝 Summary:')
    console.log(`   - Image URL: ${publicUrl}`)
    console.log(`   - Updated at: ${updateData[0].updated_at}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the upload
uploadHeroImage()
