import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  name: string
  user_type: 'admin' | 'professional'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  category_id: string
  brand_id: string
  barcode?: string
  sku?: string
  package_quantity: number
  unit: string
  purchase_price: number
  unit_cost: number
  image_url?: string
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  brand?: Brand
}

export interface Service {
  id: string
  professional_name: string
  client_name: string
  service_name: string
  service_date: string
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  created_at: string
  updated_at: string
  // Relations
  service_products?: ServiceProduct[]
}

export interface ServiceProduct {
  id: string
  service_id: string
  product_id: string
  quantity_used: number
  created_at: string
  // Relations
  product?: Product
}
