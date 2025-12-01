import { NextRequest, NextResponse } from 'next/server'
import { createClient, requireAdmin } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()

  // Get date range for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get overall stats
  const [
    { count: totalOrders },
    { count: totalUsers },
    { count: totalProducts },
    { data: revenueData },
    { data: squareRevenueData }
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('total')
      .in('status', ['processing', 'shipped', 'delivered']),
    supabase.from('square_transactions')
      .select('amount_cents')
  ])

  const webRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0
  const squareRevenue = squareRevenueData?.reduce((sum, t) => sum + (t.amount_cents || 0), 0) / 100 || 0
  const totalRevenue = webRevenue + squareRevenue

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get order stats by status
  const { data: ordersByStatus } = await supabase
    .from('orders')
    .select('status')

  const statusCounts = ordersByStatus?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Get sales over time (last 30 days)
  const { data: salesOverTime } = await supabase
    .from('orders')
    .select('created_at, total')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .in('status', ['processing', 'shipped', 'delivered'])
    .order('created_at', { ascending: true })

  // Group sales by day
  const salesByDay = salesOverTime?.reduce((acc, order) => {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { date, total: 0, count: 0 }
    }
    acc[date].total += Number(order.total)
    acc[date].count += 1
    return acc
  }, {} as Record<string, { date: string; total: number; count: number }>) || {}

  // Get top products from web sales
  const { data: webProducts } = await supabase
    .from('order_items')
    .select(`
      product_id,
      product_name,
      products!inner(image_url),
      quantity
    `)

  // Get top products from Square sales
  const { data: squareProducts } = await supabase
    .from('square_transactions')
    .select(`
      product_id,
      quantity,
      products!inner(name, image_url)
    `)
    .not('product_id', 'is', null)

  // Aggregate product sales from both channels
  const productSales: Record<string, any> = {}

  // Web sales
  webProducts?.forEach(item => {
    const key = item.product_id
    if (!productSales[key]) {
      productSales[key] = {
        product_id: item.product_id,
        product_name: item.product_name,
        image_url: item.products?.image_url,
        webQuantity: 0,
        squareQuantity: 0,
        totalQuantity: 0
      }
    }
    productSales[key].webQuantity += item.quantity
    productSales[key].totalQuantity += item.quantity
  })

  // Square sales
  squareProducts?.forEach(item => {
    const key = item.product_id
    if (!productSales[key]) {
      productSales[key] = {
        product_id: item.product_id,
        product_name: item.products?.name,
        image_url: item.products?.image_url,
        webQuantity: 0,
        squareQuantity: 0,
        totalQuantity: 0
      }
    }
    productSales[key].squareQuantity += item.quantity
    productSales[key].totalQuantity += item.quantity
    // Update name if not set
    if (!productSales[key].product_name) {
      productSales[key].product_name = item.products?.name
    }
  })

  const topProductsList = Object.values(productSales)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5)

  return NextResponse.json({
    overview: {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      webRevenue,
      squareRevenue
    },
    recentOrders,
    ordersByStatus: statusCounts,
    salesOverTime: Object.values(salesByDay),
    topProducts: topProductsList
  })
}