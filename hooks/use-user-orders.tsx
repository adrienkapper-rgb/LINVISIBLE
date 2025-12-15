'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  
  // Refs for request cancellation and debouncing
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchOrders = useCallback(async (page: number = initialPage) => {
    if (!user) {
      setOrders([])
      setPagination(null)
      return
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching user orders - Hook:', { page, limit, user_id: user.id })
      
      const response = await fetch(`/api/user-orders?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent
        signal: abortController.signal, // Add abort signal
      })
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `Erreur HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        
        throw new Error(
          errorData.details || 
          errorData.error || 
          `Erreur ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Réponse API invalide: format de données incorrect')
      }
      
      if (!Array.isArray(data.orders)) {
        throw new Error('Réponse API invalide: orders doit être un tableau')
      }
      
      console.log('Successfully fetched orders:', {
        ordersCount: data.orders.length,
        pagination: data.pagination
      })
      
      setOrders(data.orders)
      setPagination(data.pagination)

    } catch (err) {
      // Don't show error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error in useUserOrders hook:', {
        error: err,
        message: errorMessage,
        user_id: user.id,
        page,
        limit
      })
    } finally {
      setLoading(false)
    }
  }, [user, initialPage, limit])

  // Debounced fetch function
  const debouncedFetchOrders = useCallback((page: number) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      fetchOrders(page)
    }, 300) // 300ms debounce
  }, [fetchOrders])

  useEffect(() => {
    if (user) {
      debouncedFetchOrders(initialPage)
    } else {
      setOrders([])
      setPagination(null)
    }
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [user, initialPage, limit, debouncedFetchOrders])

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