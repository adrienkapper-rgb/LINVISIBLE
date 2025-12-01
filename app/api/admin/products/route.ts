import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAdmin } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()

  // Fetch products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('numero', { ascending: true }) as { data: Array<Record<string, unknown>> | null; error: Error | null }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!products) {
    return NextResponse.json([])
  }

  // Fetch sales data (Square + Web) for each product
  const { data: squareSales } = await supabase
    .from('square_transactions')
    .select('product_id, quantity')
    .eq('processed', true) as { data: Array<{ product_id: string | null; quantity: number }> | null }

  const { data: webSales } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .not('product_id', 'is', null) as { data: Array<{ product_id: string | null; quantity: number }> | null }

  // Calculate total sales per product
  const salesByProduct: Record<string, { square: number; web: number }> = {}

  squareSales?.forEach((sale) => {
    if (sale.product_id) {
      if (!salesByProduct[sale.product_id]) {
        salesByProduct[sale.product_id] = { square: 0, web: 0 }
      }
      salesByProduct[sale.product_id].square += sale.quantity
    }
  })

  webSales?.forEach((sale) => {
    if (sale.product_id) {
      if (!salesByProduct[sale.product_id]) {
        salesByProduct[sale.product_id] = { square: 0, web: 0 }
      }
      salesByProduct[sale.product_id].web += sale.quantity
    }
  })

  // Enrich products with sales data
  const enrichedProducts = products.map((product) => {
    const productId = product.id as string
    return {
      ...product,
      sales_square: salesByProduct[productId]?.square || 0,
      sales_web: salesByProduct[productId]?.web || 0,
      sales_total: (salesByProduct[productId]?.square || 0) + (salesByProduct[productId]?.web || 0),
    }
  })

  return NextResponse.json(enrichedProducts)
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