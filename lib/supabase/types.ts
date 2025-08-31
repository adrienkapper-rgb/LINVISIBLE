export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          account_type: 'particulier' | 'professionnel' | null
          company_name: string | null
          country: string
          address_formatted: string
          address_street: string | null
          address_housenumber: string | null
          postcode: string
          city: string
          country_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          account_type?: 'particulier' | 'professionnel' | null
          company_name?: string | null
          country: string
          address_formatted: string
          address_street?: string | null
          address_housenumber?: string | null
          postcode: string
          city: string
          country_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          account_type?: 'particulier' | 'professionnel' | null
          company_name?: string | null
          country?: string
          address_formatted?: string
          address_street?: string | null
          address_housenumber?: string | null
          postcode?: string
          city?: string
          country_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          price: number
          volume: string
          alcohol: number
          image_url: string | null
          description: string | null
          ingredients: string[]
          serving_instructions: string | null
          serving_size: string | null
          available: boolean
          stock_quantity: number
          weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          price: number
          volume: string
          alcohol: number
          image_url?: string | null
          description?: string | null
          ingredients?: string[]
          serving_instructions?: string | null
          serving_size?: string | null
          available?: boolean
          stock_quantity?: number
          weight?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          price?: number
          volume?: string
          alcohol?: number
          image_url?: string | null
          description?: string | null
          ingredients?: string[]
          serving_instructions?: string | null
          serving_size?: string | null
          available?: boolean
          stock_quantity?: number
          weight?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
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
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          email: string
          first_name: string
          last_name: string
          phone: string
          mondial_relay_point?: string | null
          delivery_type?: 'point-relais' | 'domicile' | null
          delivery_address?: string | null
          delivery_postal_code?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          subtotal: number
          shipping_cost: number
          total: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          mondial_relay_point?: string | null
          delivery_type?: 'point-relais' | 'domicile' | null
          delivery_address?: string | null
          delivery_postal_code?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          subtotal?: number
          shipping_cost?: number
          total?: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          total?: number
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      product_analytics: {
        Row: {
          id: string
          product_id: string
          event_type: 'view' | 'add_to_cart' | 'purchase'
          quantity: number
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          event_type: 'view' | 'add_to_cart' | 'purchase'
          quantity?: number
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          event_type?: 'view' | 'add_to_cart' | 'purchase'
          quantity?: number
          session_id?: string | null
          created_at?: string
        }
      }
      mondial_relay_points: {
        Row: {
          id: string
          point_id: string
          name: string
          address: string
          city: string
          postal_code: string
          country: string
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          point_id: string
          name: string
          address: string
          city: string
          postal_code: string
          country: string
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          point_id?: string
          name?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
    }
  }
}