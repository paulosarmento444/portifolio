"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { User } from "lucide-react"
import { AccountSidebar } from "./AccountSidebar"
import { AccountContent } from "./AccountContent"
import { MobileMenuButton } from "./MobileMenuButton"

interface MyAccountClientProps {
  viewer: any
  orders: any[]
  posts: any[]
  customer: any
}

export function MyAccountClient({ viewer, orders, posts, customer }: MyAccountClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedMenu, setSelectedMenu] = useState<string>("welcome")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  useEffect(() => {
    const menu = searchParams.get("menu")
    if (menu) {
      setSelectedMenu(menu)
    }
  }, [searchParams])

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu)
    setIsMobileMenuOpen(false)

    // Update URL without page reload
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("menu", menu)
    window.history.pushState({}, "", newUrl.toString())
  }

  return (
    <div className="relative overflow-hidden bg-black min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        ></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-400/30 mb-6">
                <User className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium">Minha Conta</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Olá, {viewer.name}!
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Gerencie sua conta, pedidos e informações pessoais em um só lugar
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <MobileMenuButton isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
              </div>

              {/* Sidebar */}
              <div className={`lg:w-80 ${isMobileMenuOpen ? "block" : "hidden lg:block"}`}>
                <AccountSidebar selectedMenu={selectedMenu} onMenuClick={handleMenuClick} userName={viewer.name} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <AccountContent
                  selectedMenu={selectedMenu}
                  viewer={viewer}
                  orders={orders}
                  posts={posts}
                  customer={customer}
                  router={router}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}
