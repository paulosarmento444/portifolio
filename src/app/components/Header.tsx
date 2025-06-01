"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll } from "../hooks/useScroll";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import Link from "next/link";
import { UserProfile } from "./UserProfile";
import { getUserName } from "../server-actions/auth.action";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Home,
  Store,
  Zap,
  Crown,
  Sparkles,
  Newspaper,
} from "lucide-react";

export default function Header() {
  const [userName, setUserName] = useState<string>("Kids");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrolled = useScroll();

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      const fetchUserName = async () => {
        try {
          const name = await getUserName();
          setUserName(name);
          localStorage.setItem("userName", name);
        } catch (error) {
          console.error("Error fetching user name:", error);
          setUserName("Kids");
        }
      };
      fetchUserName();
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 backdrop-blur-xl shadow-2xl border-b border-yellow-300/30"
            : "bg-gradient-to-b from-yellow-500/90 via-yellow-400/70 to-transparent backdrop-blur-md"
        }`}
      >
        {/* Gradient Border Effect */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent"></div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 blur-xl opacity-50"></div>

        <div className="relative container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Side - Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-yellow-200/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-white/20 to-yellow-200/20 backdrop-blur-sm p-2 rounded-xl border border-white/30">
                    <Logo />
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:block">
                <NavLinks />
              </nav>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <Link href="/my-cart">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-3 bg-gradient-to-r from-white/20 to-yellow-200/20 backdrop-blur-sm rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 group shadow-lg"
                >
                  <ShoppingBag className="w-6 h-6 text-white drop-shadow-sm group-hover:text-yellow-100 transition-colors" />

                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-yellow-200/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-lg"></div>
                </motion.div>
              </Link>

              {/* User Profile - Desktop */}
              <div className="hidden md:block">
                <UserProfile name={userName} />
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMobileMenu}
                className="lg:hidden p-3 bg-gradient-to-r from-white/20 to-yellow-200/20 backdrop-blur-sm rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 shadow-lg"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-white drop-shadow-sm" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-white drop-shadow-sm" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-80 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 lg:hidden shadow-2xl"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-amber-300/20 blur-xl"></div>

              {/* Mobile Menu Header */}
              <div className="relative flex items-center justify-between p-6 border-b border-yellow-300/30 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-white/30 to-yellow-200/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <User className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg drop-shadow-sm">
                      {userName}
                    </h3>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeMobileMenu}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Mobile Navigation */}
              <nav className="relative p-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <Home className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-lg drop-shadow-sm">
                        Início
                      </span>
                      <p className="text-yellow-100 text-sm">
                        Página principal
                      </p>
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    href="/store"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400/30 to-pink-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-lg drop-shadow-sm">
                        Loja
                      </span>
                      <p className="text-yellow-100 text-sm">
                        Todos os produtos
                      </p>
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href="/my-account"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400/30 to-emerald-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-lg drop-shadow-sm">
                        Minha Conta
                      </span>
                      <p className="text-yellow-100 text-sm">
                        Perfil e pedidos
                      </p>
                    </div>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/blog"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400/30 to-red-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <Newspaper className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-lg drop-shadow-sm">
                        Blog
                      </span>
                      <p className="text-yellow-100 text-sm">Notícias</p>
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/my-cart"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400/30 to-red-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-lg drop-shadow-sm">
                        Carrinho
                      </span>
                      <p className="text-yellow-100 text-sm">Meus produtos</p>
                    </div>
                  </Link>
                </motion.div>
              </nav>

              {/* Mobile Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-yellow-300/30 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-yellow-100 text-xs mt-2 opacity-80">
                    Versão 2.0.0
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
