import { createClient } from '@/lib/supabase/server'
import { Order, OrderItem } from '@/lib/api/orders'

export interface EmailData {
  order: Order
  orderItems?: OrderItem[]
}

// URLs des Edge Functions
const EDGE_FUNCTIONS = {
  ORDER_CONFIRMATION: 'send-order-confirmation',
  PAYMENT_CONFIRMATION: 'send-payment-confirmation', 
  ADMIN_NOTIFICATION: 'send-admin-notification',
  SHIPPING_NOTIFICATION: 'send-shipping-notification',
  DELIVERY_NOTIFICATION: 'send-delivery-notification'
}

async function callEdgeFunction(functionName: string, data: EmailData): Promise<{ success: boolean, error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase.functions.invoke(functionName, {
      body: data
    })

    if (error) {
      console.error(`Erreur Edge Function ${functionName}:`, error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Edge Function ${functionName} appelée avec succès`)
    return { success: true }

  } catch (error) {
    console.error(`Erreur appel Edge Function ${functionName}:`, error)
    return { success: false, error: (error as Error).message }
  }
}

export async function sendOrderConfirmationEmail(data: EmailData): Promise<void> {
  const result = await callEdgeFunction(EDGE_FUNCTIONS.ORDER_CONFIRMATION, data)
  if (!result.success) {
    throw new Error(`Échec envoi email confirmation: ${result.error}`)
  }
}

export async function sendPaymentConfirmationEmail(data: EmailData): Promise<void> {
  const result = await callEdgeFunction(EDGE_FUNCTIONS.PAYMENT_CONFIRMATION, data)
  if (!result.success) {
    throw new Error(`Échec envoi email paiement: ${result.error}`)
  }
}

export async function sendAdminNotificationEmail(data: EmailData): Promise<void> {
  const result = await callEdgeFunction(EDGE_FUNCTIONS.ADMIN_NOTIFICATION, data)
  if (!result.success) {
    throw new Error(`Échec envoi email admin: ${result.error}`)
  }
}

export async function sendShippingNotificationEmail(data: EmailData): Promise<void> {
  const result = await callEdgeFunction(EDGE_FUNCTIONS.SHIPPING_NOTIFICATION, data)
  if (!result.success) {
    throw new Error(`Échec envoi email expédition: ${result.error}`)
  }
}

export async function sendDeliveryNotificationEmail(data: EmailData): Promise<void> {
  const result = await callEdgeFunction(EDGE_FUNCTIONS.DELIVERY_NOTIFICATION, data)
  if (!result.success) {
    throw new Error(`Échec envoi email livraison: ${result.error}`)
  }
}