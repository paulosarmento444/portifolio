"use client"

import { motion } from "framer-motion"
import { CartItem } from "./CartItem"

interface CartContentProps {
  cart: any
  products: any[]
}

export function CartContent({ cart, products }: CartContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-4"
    >
      {cart.items.map((item: any, index: number) => {
        const product = products.find((p: any) => p.id === item.product_id)

        return <CartItem key={`${item.product_id}-${index}`} item={item} product={product} index={index} />
      })}
    </motion.div>
  )
}
