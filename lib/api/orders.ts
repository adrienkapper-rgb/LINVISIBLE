import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'
import { sendOrderConfirmationEmail, sendAdminNotificationEmail, sendShippingNotificationEmail, sendDeliveryNotificationEmail } from '@/lib/email/service'

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
  try {
    
    const supabase = await createClient()
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Prepare order data with proper validation
    const orderDataToInsert = {
      order_number: orderNumber,
      email: orderData.email,
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      phone: orderData.phone,
      mondial_relay_point: orderData.mondialRelayPoint || null,
      delivery_type: orderData.deliveryType || 'domicile',
      delivery_address: orderData.deliveryAddress || null,
      delivery_postal_code: orderData.deliveryPostalCode || null,
      delivery_city: orderData.deliveryCity || null,
      delivery_country: orderData.deliveryCountry || 'FR',
      subtotal: Number(orderData.subtotal),
      shipping_cost: Number(orderData.shippingCost),
      total: Number(orderData.total),
      status: 'pending'
    }
    
    
    // Start a transaction by creating the order first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderDataToInsert)
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
    product_price: Number(item.productPrice),
    quantity: Number(item.quantity),
    total: Number(item.productPrice) * Number(item.quantity)
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
console.log(`✅ Commande ${order.order_number} créée avec succès - les emails seront envoyés après paiement`)

return { order, error: null }
  } catch (error) {
    console.error('Unexpected error in createOrder:', error)
    return { 
      order: null, 
      error: {
        message: error instanceof Error ? error.message : 'Erreur inattendue lors de la création de la commande',
        details: error
      }
    }
  }
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

export async function getOrderByPaymentIntent(paymentIntentId: string, maxRetries = 10): Promise<Order | null> {
  const supabase = await createClient()
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()
    
    if (data) {
      console.log(`✅ Commande trouvée par PaymentIntent ${paymentIntentId} (tentative ${attempt}/${maxRetries})`)
      return data
    }
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching order by payment intent:', error)
      return null
    }
    
    if (attempt < maxRetries) {
      console.log(`🔄 Commande pour PaymentIntent ${paymentIntentId} non trouvée, retry ${attempt}/${maxRetries} dans 3s...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    } else {
      console.log(`❌ Commande pour PaymentIntent ${paymentIntentId} non trouvée après ${maxRetries} tentatives`)
    }
  }
  
  return null
}

export async function getOrderByNumber(orderNumber: string, maxRetries = 5): Promise<Order | null> {
  const supabase = await createClient()
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single()
    
    if (data) {
      console.log(`✅ Commande ${orderNumber} trouvée (tentative ${attempt}/${maxRetries})`)
      return data
    }
    
    if (error && error.code !== 'PGRST116') {
      // Si c'est une vraie erreur (pas "no rows returned"), on arrête
      console.error('Error fetching order:', error)
      return null
    }
    
    if (attempt < maxRetries) {
      console.log(`🔄 Commande ${orderNumber} non trouvée, retry ${attempt}/${maxRetries} dans 2s...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    } else {
      console.log(`❌ Commande ${orderNumber} non trouvée après ${maxRetries} tentatives`)
    }
  }
  
  return null
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