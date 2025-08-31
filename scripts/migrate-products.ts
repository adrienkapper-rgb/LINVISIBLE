import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnxhkjvcixumuvjfxdjo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGhranZjaXh1bXV2amZ4ZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODI2NjAsImV4cCI6MjA3MTM1ODY2MH0.J_J78PV9oY4slnH6XPAE_0Bf-SJf2ggftQeXJhMAIqg'

const supabase = createClient(supabaseUrl, supabaseKey)

const products = [
  {
    slug: "french-mule",
    name: "French Mule",
    price: 24.90,
    volume: "500ml",
    alcohol: 32.6,
    image_url: "N°01 - French Mule copie.jpg",
    description: "Un twist français du célèbre Moscow Mule avec une touche de cognac infusé au citron vert",
    ingredients: ["Jus de citron vert", "Jus de gingembre", "Cognac infusé citron vert"],
    serving_instructions: "Servir avec 15cl de Tonic, 5cl de N°1 et des glaçons",
    serving_size: "20cl",
    available: true,
    stock_quantity: 100
  },
  {
    slug: "cuba-libre",
    name: "Cuba Libre",
    price: 22.80,
    volume: "500ml",
    alcohol: 24.7,
    image_url: "N°02 - Cuba Libre copie.jpg",
    description: "Le classique cubain revisité avec notre mélange artisanal",
    ingredients: ["Bitter tropical", "Jus de citron vert", "Rhum"],
    serving_instructions: "Servir avec 14cl de cola, 6cl de N°2 et des glaçons",
    serving_size: "20cl",
    available: true,
    stock_quantity: 100
  },
  {
    slug: "cosmopolitan",
    name: "Cosmopolitan",
    price: 20.50,
    volume: "500ml",
    alcohol: 19.2,
    image_url: "N°03 - Cosmopolitan copie.jpg",
    description: "L'élégance new-yorkaise dans un cocktail sophistiqué",
    ingredients: ["Jus de canneberge", "Cordial de citron vert", "Triple sec", "Vodka citron"],
    serving_instructions: "Servir 12cl de N°3 avec des glaçons",
    serving_size: "12cl",
    available: true,
    stock_quantity: 100
  },
  {
    slug: "mojito",
    name: "Mojito",
    price: 21.40,
    volume: "500ml",
    alcohol: 18.7,
    image_url: "N°04 - Mojito copie.jpg",
    description: "La fraîcheur cubaine avec menthe et citron vert",
    ingredients: ["Cordial de menthe", "Jus de citron vert", "Rhum"],
    serving_instructions: "Servir avec 12cl de tonic, 8cl de N°4 et des glaçons",
    serving_size: "20cl",
    available: true,
    stock_quantity: 100
  },
  {
    slug: "penicillin",
    name: "Penicillin",
    price: 21.90,
    volume: "500ml",
    alcohol: 20.9,
    image_url: "N°05 - Penicillin copie.jpg",
    description: "Un cocktail médicinal moderne au whisky tourbé",
    ingredients: ["Whisky tourbé", "Jus de citron", "Cordial miel/gingembre", "Whisky"],
    serving_instructions: "Servir 12cl de N°5 avec des glaçons",
    serving_size: "12cl",
    available: true,
    stock_quantity: 100
  },
  {
    slug: "cardamome",
    name: "Cardamome",
    price: 21.00,
    volume: "500ml",
    alcohol: 21.6,
    image_url: "06.jpg",
    description: "Une création unique au whisky infusé à la cardamome",
    ingredients: ["Sirop de miel", "Jus de citron", "Whisky infusé cardamome"],
    serving_instructions: "Servir 8cl de N°6 avec 10cl de nectar de poire et des glaçons",
    serving_size: "18cl",
    available: true,
    stock_quantity: 100
  }
]

async function migrateProducts() {
  console.log('Starting product migration...')
  
  for (const product of products) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) {
      console.error(`Error inserting product ${product.name}:`, error)
    } else {
      console.log(`Successfully inserted product: ${product.name}`)
    }
  }
  
  console.log('Product migration completed!')
}

migrateProducts()