import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAdmin } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const language = searchParams.get('lang') || 'fr'

  // Validate language
  if (!['fr', 'en'].includes(language)) {
    return NextResponse.json(
      { error: 'Invalid language. Must be "fr" or "en"' },
      { status: 400 }
    )
  }

  const { data: content, error } = await supabase
    .from('about_page_content')
    .select('*')
    .eq('language', language)
    .order('section_key')
    .order('content_key')

  if (error) {
    console.error('Error fetching about page content:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Organize content by section
  const organizedContent: Record<string, Record<string, string>> = {}

  content.forEach((item) => {
    if (!organizedContent[item.section_key]) {
      organizedContent[item.section_key] = {}
    }
    organizedContent[item.section_key][item.content_key] = item.content_value
  })

  return NextResponse.json({
    language,
    sections: organizedContent,
    raw: content,
  })
}

export async function PATCH(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()
  const body = await request.json()

  const { language, sections } = body

  // Validate inputs
  if (!language || !['fr', 'en'].includes(language)) {
    return NextResponse.json(
      { error: 'Invalid or missing language. Must be "fr" or "en"' },
      { status: 400 }
    )
  }

  if (!sections || typeof sections !== 'object') {
    return NextResponse.json(
      { error: 'Invalid or missing sections data' },
      { status: 400 }
    )
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Prepare updates
  const updates: Array<{
    language: string
    section_key: string
    content_key: string
    content_value: string
    updated_at: string
    updated_by: string | null
  }> = []

  for (const [sectionKey, contents] of Object.entries(sections)) {
    if (typeof contents === 'object' && contents !== null) {
      for (const [contentKey, contentValue] of Object.entries(contents)) {
        if (typeof contentValue === 'string') {
          updates.push({
            language,
            section_key: sectionKey,
            content_key: contentKey,
            content_value: contentValue,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null,
          })
        }
      }
    }
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { error: 'No valid content to update' },
      { status: 400 }
    )
  }

  // Perform upsert
  const { data, error } = await supabase
    .from('about_page_content')
    .upsert(updates, {
      onConflict: 'language,section_key,content_key',
      ignoreDuplicates: false,
    })
    .select()

  if (error) {
    console.error('Error updating about page content:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    updated: data?.length || 0,
    message: `Successfully updated ${data?.length || 0} content items`,
  })
}
