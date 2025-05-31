"use client"
import { motion } from "framer-motion"
import { CreditCard, Smartphone, DollarSign, Check } from "lucide-react"

interface PaymentMethodSelectorProps {
  paymentMethods: any[]
  selectedMethod: string
  onMethodChange: (method: string) => void
}

export function PaymentMethodSelector({ paymentMethods, selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case "pix":
        return <Smartphone className="w-5 h-5" />
      case "bacs":
      case "credit_card":
        return <CreditCard className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getMethodColor = (methodId: string) => {
    switch (methodId) {
      case "pix":
        return "from-green-500 to-emerald-500"
      case "bacs":
      case "credit_card":
        return "from-blue-500 to-cyan-500"
      default:
        return "from-purple-500 to-pink-500"
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="text-white font-medium">Método de Pagamento:</h4>
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <motion.button
            key={method.id}
            onClick={() => onMethodChange(method.id)}
            className={`w-full p-4 rounded-xl border transition-all duration-200 ${
              selectedMethod === method.id
                ? "bg-white/10 border-purple-400/50"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getMethodColor(method.id)} flex items-center justify-center`}
                >
                  {getMethodIcon(method.id)}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{method.title}</p>
                  <p className="text-gray-400 text-sm">{method.description}</p>
                </div>
              </div>
              {selectedMethod === method.id && (
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
