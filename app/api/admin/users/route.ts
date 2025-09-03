import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAdmin } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const { data: profiles, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get order counts for each user
  const userEmails = profiles?.map(p => p.email) || []
  
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('email')
    .in('email', userEmails)

  const orderCountMap = orderCounts?.reduce((acc, order) => {
    acc[order.email] = (acc[order.email] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const usersWithStats = profiles?.map(profile => ({
    ...profile,
    totalOrders: orderCountMap[profile.email] || 0
  }))

  return NextResponse.json({
    users: usersWithStats,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}