/**
 * Typed Supabase Client Helpers
 *
 * This module provides typed wrappers for Supabase operations
 * to work around type inference issues with @supabase/ssr
 */

import { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

// Export all table types for easy access
export type Tables = Database['public']['Tables']
export type TableName = keyof Tables

// Row types for each table
export type TableRow<T extends TableName> = Tables[T]['Row']
export type TableInsert<T extends TableName> = Tables[T]['Insert']
export type TableUpdate<T extends TableName> = Tables[T]['Update']

// Specific table types for commonly used tables
export type ProductRow = TableRow<'products'>
export type ProductInsert = TableInsert<'products'>
export type ProductUpdate = TableUpdate<'products'>

export type OrderRow = TableRow<'orders'>
export type OrderInsert = TableInsert<'orders'>
export type OrderUpdate = TableUpdate<'orders'>

export type OrderItemRow = TableRow<'order_items'>
export type OrderItemInsert = TableInsert<'order_items'>

export type ProfileRow = TableRow<'profiles'>
export type ProfileInsert = TableInsert<'profiles'>
export type ProfileUpdate = TableUpdate<'profiles'>

export type ProductionSessionRow = TableRow<'production_sessions'>
export type ProductionSessionInsert = TableInsert<'production_sessions'>
export type ProductionSessionUpdate = TableUpdate<'production_sessions'>

export type ProductionItemRow = TableRow<'production_items'>
export type ProductionItemInsert = TableInsert<'production_items'>

export type ProductionConsumptionRow = TableRow<'production_consumption'>
export type ProductionConsumptionInsert = TableInsert<'production_consumption'>

export type PurchaseItemRow = TableRow<'purchase_items'>
export type PurchaseItemInsert = TableInsert<'purchase_items'>
export type PurchaseItemUpdate = TableUpdate<'purchase_items'>

export type PurchaseStockMovementRow = TableRow<'purchase_stock_movements'>
export type PurchaseStockMovementInsert = TableInsert<'purchase_stock_movements'>

export type RecipeRow = TableRow<'recipes'>
export type RecipeIngredientRow = TableRow<'recipe_ingredients'>

export type GeneralExpenseRow = TableRow<'general_expenses'>
export type GeneralExpenseInsert = TableInsert<'general_expenses'>
export type GeneralExpenseUpdate = TableUpdate<'general_expenses'>

export type ContactMessageRow = TableRow<'contact_messages'>
export type ContactMessageUpdate = TableUpdate<'contact_messages'>

export type AboutPageContentRow = TableRow<'about_page_content'>
export type AboutPageContentInsert = TableInsert<'about_page_content'>

export type InterfaceSettingsRow = TableRow<'interface_settings'>
export type InterfaceSettingsUpdate = TableUpdate<'interface_settings'>

export type StockMovementRow = TableRow<'stock_movements'>
export type StockMovementInsert = TableInsert<'stock_movements'>

export type SquareTransactionRow = TableRow<'square_transactions'>
export type SquareTransactionUpdate = TableUpdate<'square_transactions'>

export type SquareProductMappingRow = TableRow<'square_product_mapping'>

export type PaymentRow = TableRow<'payments'>
export type PaymentInsert = TableInsert<'payments'>

// RPC function types
export type RpcFunctions = Database['public']['Functions']

// Helper type to get RPC function args and return types
export type RpcArgs<T extends keyof RpcFunctions> = RpcFunctions[T]['Args']
export type RpcReturn<T extends keyof RpcFunctions> = RpcFunctions[T]['Returns']

/**
 * Type-safe wrapper for Supabase select operations
 * Use this when you need explicit typing for query results
 */
export function typedSelect<T extends TableName>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any>,
  table: T
) {
  return client.from(table) as ReturnType<SupabaseClient<Database>['from']>
}

/**
 * Type assertion helper for query results
 * Use when TypeScript can't infer the correct type
 */
export function asRows<T extends TableName>(data: unknown): TableRow<T>[] {
  return data as TableRow<T>[]
}

export function asRow<T extends TableName>(data: unknown): TableRow<T> {
  return data as TableRow<T>
}
