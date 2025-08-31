import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'
import { sendOrderConfirmationEmail, sendShippingNotificationEmail, sendDeliveryNotificationEmail } from '@/lib/email/edge-functions'

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

interface CreateOrderData {
  email: string
  firstName: string
  lastName: string
  phone: string
  mondialRelayPoint?: string
  deliveryType: 'point-relais' | 'domicile'
  deliveryAddress?: string
  deliveryPostalCode?: string
  deliveryCity?: string
  deliveryCountry: string
  items: {
    productId: string
    productName: string
    productPrice: number
    quantity: number
  }[]
  subtotal: number
  shippingCost: number
  total: number
}

export async function createOrder(orderData: CreateOrderData): Promise<{ order: Order | null, error: any }> {
  const supabase = await createClient()
  
  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  // Start a transaction by creating the order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      email: orderData.email,
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      phone: orderData.phone,
      mondial_relay_point: orderData.mondialRelayPoint || null,
      delivery_type: orderData.deliveryType,
      delivery_address: orderData.deliveryAddress || null,
      delivery_postal_code: orderData.deliveryPostalCode || null,
      delivery_city: orderData.deliveryCity || null,
      delivery_country: orderData.deliveryCountry,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shippingCost,
      total: orderData.total,
      status: 'pending'
    })
    .select()
    .single()
  
  if (orderError) {
    console.error('Error creating order:', orderError)
    return { order: null, error: orderError }
  }
  
  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    product_price: item.productPrice,
    quantity: item.quantity,
    total: item.productPrice * item.quantity
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    // Should ideally rollback the order creation here
    return { order: null, error: itemsError }
  }
  
  // Track purchase events
  for (const item of orderData.items) {
    await supabase
      .from('product_analytics')
      .insert({
        product_id: item.productId,
        event_type: 'purchase',
        quantity: item.quantity
      })
  }
  
  // Send order confirmation email
  try {
    const orderItems = orderData.items.map(item => ({
      id: '', // Not needed for email
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.productPrice,
      quantity: item.quantity,
      total: item.productPrice * item.quantity,
      created_at: new Date().toISOString()
    }))
    
    await sendOrderConfirmationEmail({ order, orderItems })
  } catch (emailError) {
    console.error('Erreur envoi email confirmation:', emailError)
    // Don't fail the order creation if email fails
  }
  
  return { order, error: null }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  stripePaymentIntentId?: string
): Promise<{ success: boolean, error: any }> {
  const supabase = await createClient()
  
  // Get the current order before updating
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  
  if (fetchError) {
    console.error('Error fetching order:', fetchError)
    return { success: false, error: fetchError }
  }
  
  const previousStatus = currentOrder.status
  
  const updateData: any = { status }
  if (stripePaymentIntentId) {
    updateData.stripe_payment_intent_id = stripePaymentIntentId
  }
  
  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
  
  if (error) {
    console.error('Error updating order status:', error)
    return { success: false, error }
  }
  
  // Send status change emails
  if (previousStatus !== status) {
    try {
      const orderItems = await getOrderItems(orderId)
      const updatedOrder = { ...currentOrder, status }
      
      if (status === 'shipped') {
        await sendShippingNotificationEmail({ order: updatedOrder, orderItems })
      } else if (status === 'delivered') {
        await sendDeliveryNotificationEmail({ order: updatedOrder, orderItems })
      }
    } catch (emailError) {
      console.error('Erreur envoi email changement statut:', emailError)
      // Don't fail the status update if email fails
    }
  }
  
  return { success: true, error: null }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()
  
  if (error) {
    console.error('Error fetching order:', error)
    return null
  }
  
  return data
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
  
  if (error) {
    console.error('Error fetching order items:', error)
    return []
  }
  
  return data || []
}