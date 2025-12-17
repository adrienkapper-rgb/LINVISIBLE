export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      about_page_content: {
        Row: {
          content_key: string
          content_value: string
          id: string
          language: string
          section_key: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_value: string
          id?: string
          language?: string
          section_key: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_value?: string
          id?: string
          language?: string
          section_key?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          amount: number
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          used: boolean | null
          used_at: string | null
          used_by_order_id: string | null
        }
        Insert: {
          amount: number
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          used_by_order_id?: string | null
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          used_by_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_used_by_order_id_fkey"
            columns: ["used_by_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      general_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          expense_date: string
          id: string
          invoice_number: string | null
          notes: string | null
          paid_by: string | null
          paid_by_company: boolean | null
          reimbursed_amount: number | null
          reimbursed_date: string | null
          reimbursement_status: string | null
          supplier: string | null
          total_tva: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          expense_date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_by?: string | null
          paid_by_company?: boolean | null
          reimbursed_amount?: number | null
          reimbursed_date?: string | null
          reimbursement_status?: string | null
          supplier?: string | null
          total_tva?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_by?: string | null
          paid_by_company?: boolean | null
          reimbursed_amount?: number | null
          reimbursed_date?: string | null
          reimbursement_status?: string | null
          supplier?: string | null
          total_tva?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "general_expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interface_settings: {
        Row: {
          hero_image_url: string
          id: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          hero_image_url: string
          id?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          hero_image_url?: string
          id?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          total: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_country: string | null
          delivery_postal_code: string | null
          delivery_type: string | null
          discount_amount: number | null
          discount_code: string | null
          email: string
          first_name: string
          id: string
          is_gift: boolean | null
          last_name: string
          mondial_relay_point: string | null
          order_number: string
          phone: string
          recipient_first_name: string | null
          recipient_last_name: string | null
          shipping_cost: number
          status: string | null
          stripe_fee: number | null
          stripe_payment_intent_id: string | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_postal_code?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          email: string
          first_name: string
          id?: string
          is_gift?: boolean | null
          last_name: string
          mondial_relay_point?: string | null
          order_number: string
          phone: string
          recipient_first_name?: string | null
          recipient_last_name?: string | null
          shipping_cost: number
          status?: string | null
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_postal_code?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          email?: string
          first_name?: string
          id?: string
          is_gift?: boolean | null
          last_name?: string
          mondial_relay_point?: string | null
          order_number?: string
          phone?: string
          recipient_first_name?: string | null
          recipient_last_name?: string | null
          shipping_cost?: number
          status?: string | null
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string
          provider_payment_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string
          provider_payment_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string
          provider_payment_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          product_id: string | null
          quantity: number | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_consumption: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          quantity_consumed: number
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity_consumed: number
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity_consumed?: number
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_consumption_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "purchase_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_consumption_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "production_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      production_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity_produced: number
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity_produced: number
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity_produced?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "production_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      production_sessions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          session_date: string
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          session_date: string
          status?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          alcohol: number
          available: boolean | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          low_stock_threshold: number | null
          name: string
          numero: number
          price: number
          serving_instructions: string | null
          serving_size: string | null
          slug: string
          stock_quantity: number | null
          updated_at: string | null
          volume: string
          weight: number
        }
        Insert: {
          alcohol: number
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          low_stock_threshold?: number | null
          name: string
          numero: number
          price: number
          serving_instructions?: string | null
          serving_size?: string | null
          slug: string
          stock_quantity?: number | null
          updated_at?: string | null
          volume: string
          weight?: number
        }
        Update: {
          alcohol?: number
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          low_stock_threshold?: number | null
          name?: string
          numero?: number
          price?: number
          serving_instructions?: string | null
          serving_size?: string | null
          slug?: string
          stock_quantity?: number | null
          updated_at?: string | null
          volume?: string
          weight?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          address_formatted: string
          city: string
          company_name: string | null
          country: string
          country_code: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_admin: boolean
          last_name: string
          phone: string | null
          postcode: string
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          address_formatted: string
          city: string
          company_name?: string | null
          country: string
          country_code: string
          created_at?: string | null
          email: string
          first_name: string
          id: string
          is_admin?: boolean
          last_name: string
          phone?: string | null
          postcode: string
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          address_formatted?: string
          city?: string
          company_name?: string | null
          country?: string
          country_code?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_admin?: boolean
          last_name?: string
          phone?: string | null
          postcode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          alcohol_percentage: number | null
          archived: boolean | null
          avg_unit_price: number | null
          category_id: string | null
          created_at: string | null
          current_stock: number | null
          default_packaging_size: number | null
          id: string
          is_homemade: boolean | null
          last_unit_price: number | null
          low_stock_threshold: number | null
          name: string
          notes: string | null
          unit: string
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          alcohol_percentage?: number | null
          archived?: boolean | null
          avg_unit_price?: number | null
          category_id?: string | null
          created_at?: string | null
          current_stock?: number | null
          default_packaging_size?: number | null
          id?: string
          is_homemade?: boolean | null
          last_unit_price?: number | null
          low_stock_threshold?: number | null
          name: string
          notes?: string | null
          unit?: string
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          alcohol_percentage?: number | null
          archived?: boolean | null
          avg_unit_price?: number | null
          category_id?: string | null
          created_at?: string | null
          current_stock?: number | null
          default_packaging_size?: number | null
          id?: string
          is_homemade?: boolean | null
          last_unit_price?: number | null
          low_stock_threshold?: number | null
          name?: string
          notes?: string | null
          unit?: string
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "purchase_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_lines: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          packaging_size: number | null
          purchase_id: string | null
          quantity: number
          total_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          packaging_size?: number | null
          purchase_id?: string | null
          quantity: number
          total_price?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          packaging_size?: number | null
          purchase_id?: string | null
          quantity?: number
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "purchase_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_lines_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_stock_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string | null
          movement_type: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string | null
          movement_type: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string | null
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "purchase_items"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_by: string | null
          paid_by_company: boolean | null
          purchase_date: string
          purchase_type: string | null
          reimbursed_amount: number | null
          reimbursed_date: string | null
          reimbursement_status: string | null
          supplier: string | null
          total_amount: number | null
          total_ttc: number | null
          total_tva: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_by?: string | null
          paid_by_company?: boolean | null
          purchase_date?: string
          purchase_type?: string | null
          reimbursed_amount?: number | null
          reimbursed_date?: string | null
          reimbursement_status?: string | null
          supplier?: string | null
          total_amount?: number | null
          total_ttc?: number | null
          total_tva?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_by?: string | null
          paid_by_company?: boolean | null
          purchase_date?: string
          purchase_type?: string | null
          reimbursed_amount?: number | null
          reimbursed_date?: string | null
          reimbursement_status?: string | null
          supplier?: string | null
          total_amount?: number | null
          total_ttc?: number | null
          total_tva?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          quantity_per_bottle: number
          recipe_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity_per_bottle: number
          recipe_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity_per_bottle?: number
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "purchase_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string | null
          id: string
          labor_cost: number | null
          notes: string | null
          output_volume_ml: number | null
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          labor_cost?: number | null
          notes?: string | null
          output_volume_ml?: number | null
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          labor_cost?: number | null
          notes?: string | null
          output_volume_ml?: number | null
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      secondary_recipe_ingredients: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          quantity: number
          recipe_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          quantity: number
          recipe_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secondary_recipe_ingredients_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "purchase_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secondary_recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "secondary_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      secondary_recipes: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          labor_cost: number | null
          notes: string | null
          output_quantity: number
          output_unit: string
          preparation_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          labor_cost?: number | null
          notes?: string | null
          output_quantity?: number
          output_unit?: string
          preparation_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          labor_cost?: number | null
          notes?: string | null
          output_quantity?: number
          output_unit?: string
          preparation_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secondary_recipes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "purchase_items"
            referencedColumns: ["id"]
          },
        ]
      }
      square_product_mapping: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          square_catalog_id: string
          square_product_name: string | null
          square_variation_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          square_catalog_id: string
          square_product_name?: string | null
          square_variation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          square_catalog_id?: string
          square_product_name?: string | null
          square_variation_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "square_product_mapping_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      square_transactions: {
        Row: {
          amount_cents: number
          id: string
          line_item_uid: string | null
          location_name: string | null
          processed: boolean | null
          product_id: string | null
          quantity: number
          square_catalog_id: string | null
          square_fee: number | null
          square_order_id: string | null
          square_transaction_id: string
          synced_at: string | null
          transaction_date: string
        }
        Insert: {
          amount_cents: number
          id?: string
          line_item_uid?: string | null
          location_name?: string | null
          processed?: boolean | null
          product_id?: string | null
          quantity: number
          square_catalog_id?: string | null
          square_fee?: number | null
          square_order_id?: string | null
          square_transaction_id: string
          synced_at?: string | null
          transaction_date: string
        }
        Update: {
          amount_cents?: number
          id?: string
          line_item_uid?: string | null
          location_name?: string | null
          processed?: boolean | null
          product_id?: string | null
          quantity?: number
          square_catalog_id?: string | null
          square_fee?: number | null
          square_order_id?: string | null
          square_transaction_id?: string
          synced_at?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "square_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_item_cmp: { Args: { p_item_id: string }; Returns: number }
      cleanup_expired_pending_orders: { Args: never; Returns: undefined }
      create_user_profile: {
        Args: {
          account_type?: string
          address_formatted: string
          city: string
          company_name?: string
          country: string
          country_code: string
          first_name: string
          last_name: string
          phone?: string
          postcode: string
          user_email: string
          user_id: string
        }
        Returns: undefined
      }
      decrement_purchase_item_stock: {
        Args: { p_item_id: string; p_quantity: number }
        Returns: undefined
      }
      decrement_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      get_stock_movements_with_session_date: {
        Args: { p_item_id: string }
        Returns: {
          created_at: string
          id: string
          item_id: string
          movement_type: string
          notes: string
          quantity: number
          reference_id: string
          reference_type: string
          session_date: string
        }[]
      }
      increment_purchase_item_stock: {
        Args: { p_item_id: string; p_quantity: number }
        Returns: undefined
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      recalculate_product_stock: {
        Args: { p_product_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
