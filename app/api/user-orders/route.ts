import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { 
          error: 'Erreur d\'authentification', 
          details: authError.message 
        },
        { status: 401 }
      )
    }
    
    if (!user) {
      console.log('No authenticated user found')
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }
    
    console.log('Authenticated user found:', { 
      id: user.id, 
      email: user.email,
      role: user.role 
    })

    // Get search parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    console.log('Fetching orders for user:', {
      user_id: user.id,
      user_email: user.email,
      page,
      limit,
      offset
    })

    // Get orders for this user by email (table doesn't have customer_id column)
    console.log('Querying orders by email:', user.email)
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_price,
          quantity,
          total
        )
      `)
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (ordersError) {
      console.error('Error fetching user orders:', {
        error: ordersError,
        user_id: user.id,
        user_email: user.email,
        page,
        limit,
        offset
      })
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération des commandes',
          details: ordersError.message,
          code: ordersError.code
        },
        { status: 500 }
      )
    }

    // Get total count for pagination by email
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('email', user.email)

    if (countError) {
      console.error('Error counting user orders:', {
        error: countError,
        user_id: user.id,
        user_email: user.email
      })
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur inattendue' },
      { status: 500 }
    )
  }
}