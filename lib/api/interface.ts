import { createClient } from '@/lib/supabase/server'
import type { InterfaceSettingsRow, AboutPageContentRow } from '@/lib/supabase/typed-client'

export async function getHeroImageUrl(): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('interface_settings')
    .select('hero_image_url')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('Error fetching hero image URL:', error)
    // Fallback to default image if error
    return 'https://rnxhkjvcixumuvjfxdjo.supabase.co/storage/v1/object/public/product-images/hero-image.png'
  }

  const typedData = data as Pick<InterfaceSettingsRow, 'hero_image_url'> | null
  return typedData?.hero_image_url || 'https://rnxhkjvcixumuvjfxdjo.supabase.co/storage/v1/object/public/product-images/hero-image.png'
}

export async function getInterfaceSettings() {
  const supabase = await createClient()

  const { data, error} = await supabase
    .from('interface_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('Error fetching interface settings:', error)
    return null
  }

  return data
}

// About page content types
export interface AboutPageContent {
  hero: {
    title: string
    subtitle: string
  }
  artisan: {
    title: string
    paragraph_1: string
  }
  professionals: {
    title: string
    paragraph_1: string
    paragraph_2: string
  }
  editor: {
    title: string
    paragraph_1: string
    paragraph_2: string
  }
}

export async function getAboutPageContent(language: 'fr' | 'en' = 'fr'): Promise<AboutPageContent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('about_page_content')
    .select('*')
    .eq('language', language)

  if (error) {
    console.error('Error fetching about page content:', error)
    return null
  }

  const typedData = (data || []) as AboutPageContentRow[]

  // Organize content by section
  const content: Record<string, Record<string, string>> = {
    hero: {},
    artisan: {},
    professionals: {},
    editor: {},
  }

  typedData.forEach((item) => {
    if (content[item.section_key]) {
      content[item.section_key][item.content_key] = item.content_value || ''
    }
  })

  return content as unknown as AboutPageContent
}
