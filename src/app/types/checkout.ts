import type React from "react"
export interface CartItem {
  product_id: string
  quantity: number
  total: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface Product {
  id: string
  name: string
  images?: Array<{ src: string }>
  price: number
}

export interface PaymentMethod {
  id: string
  title: string
  description?: string
}

export interface CheckoutStep {
  label: string
  description: React.ReactNode
  isValid?: boolean
}

export interface OrderData {
  customer_id: string
  billing: any
  line_items: Array<{
    product_id: string
    quantity: number
  }>
  payment_method: string
}
