import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const products = [
  {
    slug: "french-mule",
    name: "French Mule",
    price: 24.90,
    volume: "500ml",
    alcohol: 32.6,
    image: "N°01 - French Mule copie.jpg",
    clean_image: "n01-french-mule-copie.jpg",
    description: "Un twist français du célèbre Moscow Mule avec une touche de cognac infusé au citron vert",
    ingredients: ["Jus de citron vert", "Jus de gingembre", "Cognac infusé citron vert"],
    serving_instructions: "Servir avec 15cl de Tonic, 5cl de N°1 et des glaçons",
    serving_size: "20cl",
    available: true,
    stock_quantity: 10
  },
  {
    slug: "cuba-libre",
    name: "Cuba Libre", 
    price: 22.80,
    volume: "500ml",
    alcohol: 24.7,
    image: "N°02 - Cuba Libre copie.jpg",
    clean_image: "n02-cuba-libre-copie.jpg",
    description: "Le classique cubain revisité avec notre mélange artisanal",
    ingredients: ["Bitter tropical", "Jus de citron vert", "Rhum"],
    serving_instructions: "Servir avec 14cl de cola, 6cl de N°2 et des glaçons",
    serving_size: "20cl",
    available: true,
    stock_quantity: 10
  },
  {
    slug: "cosmopolitan",
    name: "Cosmopolitan",
    price: 20.50,
    volume: "500ml", 
    alcohol: 19.2,
    image: "N°03 - Cosmopolitan copie.jpg",
    clean_image: "n03-cosmopolitan-copie.jpg",
    description: "L'élégance new-yorkaise dans un cocktail sophistiqué",
    ingredients: ["Jus de canneberge", "Cordial de citron vert", "Triple sec", "Vodka citron"],
    serving_instructions: "Servir 12cl de N°3 avec des glaçons",
    serving_size: "12cl",
    available: true,
    stock_quantity: 10
  },
  {
    slug: "mojito",
    name: "Mojito",
    price: 21.40,
    volume: "500ml",
    alcohol: 18.7,
    image: "N°04 - Mojito copie.jpg",
    clean_image: "n04-mojito-copie.jpg", 
    description: "La fraîcheur cubaine avec menthe et citron vert",
    ingredients: ["Cordial de menthe", "Jus de citron vert", "Rhum"],
    serving_instructions: "Servir avec 12cl de tonic, 8cl de N°4 et des glaçons",
    serving_size: "20cl",
    available: true,
    stock_quantity: 10
  },
  {
    slug: "penicillin", 
    name: "Penicillin",
    price: 21.90,
    volume: "500ml",
    alcohol: 20.9,
    image: "N°05 - Penicillin copie.jpg",
    clean_image: "n05-penicillin-copie.jpg",
    description: "Un cocktail médicinal moderne au whisky tourbé", 
    ingredients: ["Whisky tourbé", "Jus de citron", "Cordial miel/gingembre", "Whisky"],
    serving_instructions: "Servir 12cl de N°5 avec des glaçons",
    serving_size: "12cl",
    available: true,
    stock_quantity: 10
  },
  {
    slug: "cardamome",
    name: "Cardamome",
    price: 21.00,
    volume: "500ml", 
    alcohol: 21.6,
    image: "06.jpg",
    clean_image: "06.jpg",
    description: "Une création unique au whisky infusé à la cardamome",
    ingredients: ["Sirop de miel", "Jus de citron", "Whisky infusé cardamome"],
    serving_instructions: "Servir 8cl de N°6 avec 10cl de nectar de poire et des glaçons", 
    serving_size: "18cl",
    available: true,
    stock_quantity: 10
  }
];

async function uploadImages() {
  console.log('📷 Upload des images vers Supabase...')
  
  const publicDir = join(process.cwd(), 'public', 'products')
  const files = readdirSync(publicDir)
  
  for (const file of files) {
    if (file.endsWith('.jpg')) {
      console.log(`Uploading ${file}...`)
      
      // Nettoyer le nom de fichier pour Supabase
      const cleanFileName = file
        .replace(/°/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '')
        .toLowerCase()
      
      const filePath = join(publicDir, file)
      const fileBuffer = readFileSync(filePath)
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(cleanFileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })
      
      if (error) {
        console.error(`Error uploading ${file}:`, error)
      } else {
        console.log(`✅ ${file} uploaded as ${cleanFileName}`)
      }
    }
  }
}

async function insertProducts() {
  console.log('📦 Insertion des produits...')
  
  const productsWithImageUrls = await Promise.all(
    products.map(async (product) => {
      const { data } = await supabase.storage
        .from('product-images')
        .getPublicUrl(product.clean_image)
      
      return {
        slug: product.slug,
        name: product.name,
        price: product.price,
        volume: product.volume,
        alcohol: product.alcohol,
        image_url: data.publicUrl,
        description: product.description,
        ingredients: product.ingredients,
        serving_instructions: product.serving_instructions,
        serving_size: product.serving_size,
        available: product.available,
        stock_quantity: product.stock_quantity
      }
    })
  )
  
  const { data, error } = await supabase
    .from('products')
    .upsert(productsWithImageUrls, { onConflict: 'slug' })
  
  if (error) {
    console.error('Error inserting products:', error)
  } else {
    console.log('✅ Produits insérés avec succès')
  }
}

async function main() {
  try {
    await uploadImages()
    await insertProducts()
    console.log('🎉 Migration terminée avec succès!')
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

main()