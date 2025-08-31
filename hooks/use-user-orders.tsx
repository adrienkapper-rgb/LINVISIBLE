'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export interface OrderItem {
  id: string
  product_name: string
  product_price: number
  quantity: number
  total: number
}

export interface UserOrder {
  id: string
  order_number: string
  email: string
  first_name: string
  last_name: string
  phone: string
  mondial_relay_point: string | null
  delivery_type: 'point-relais' | 'domicile' | null
  delivery_address: string | null
  delivery_postal_code: string | null
  delivery_city: string | null
  delivery_country: string | null
  subtotal: number
  shipping_cost: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export interface OrdersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UseUserOrdersResult {
  orders: UserOrder[]
  loading: boolean
  error: string | null
  pagination: OrdersPagination | null
  refetch: (page?: number) => Promise<void>
}

export function useUserOrders(initialPage: number = 1, limit: number = 10): UseUserOrdersResult {
  const { user } = useAuth()
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<OrdersPagination | null>(null)

  const fetchOrders = async (page: number = initialPage) => {
    if (!user) {
      setOrders([])
      setPagination(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user-orders?page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des commandes')
      }

      const data = await response.json()
      setOrders(data.orders)
      setPagination(data.pagination)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error fetching user orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(initialPage)
  }, [user, initialPage, limit])

  return {
    orders,
    loading,
    error,
    pagination,
    refetch: fetchOrders
  }
}

// Helper function to get status display info
export function getOrderStatusInfo(status: UserOrder['status']) {
  const statusMap = {
    pending: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Commande en cours de traitement'
    },
    processing: {
      label: 'En préparation',
      color: 'bg-blue-100 text-blue-800',
      description: 'Commande en cours de préparation'
    },
    shipped: {
      label: 'Expédiée',
      color: 'bg-purple-100 text-purple-800',
      description: 'Commande expédiée'
    },
    delivered: {
      label: 'Livrée',
      color: 'bg-green-100 text-green-800',
      description: 'Commande livrée'
    },
    cancelled: {
      label: 'Annulée',
      color: 'bg-red-100 text-red-800',
      description: 'Commande annulée'
    }
  }

  return statusMap[status] || statusMap.pending
}