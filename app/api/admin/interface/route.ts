import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAdmin } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from('interface_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('Error fetching interface settings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(settings)
}

export async function PATCH(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()
  const body = await request.json()

  // Validate hero_image_url
  if (!body.hero_image_url || typeof body.hero_image_url !== 'string') {
    return NextResponse.json(
      { error: 'hero_image_url est requis et doit être une chaîne' },
      { status: 400 }
    )
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: settings, error } = await supabase
    .from('interface_settings')
    .update({
      hero_image_url: body.hero_image_url,
      updated_at: new Date().toISOString(),
      updated_by: user?.id || null,
    })
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    console.error('Error updating interface settings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(settings)
}
