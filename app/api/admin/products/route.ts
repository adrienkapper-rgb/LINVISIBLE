import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAdmin } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()
  const body = await request.json()

  console.log('Creating product with body:', JSON.stringify(body, null, 2))

  const { data, error } = await supabase
    .from('products')
    .insert([body])
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}