"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, ArrowUpRight, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Post {
  title: string
  content: string
  uri: string
  date: string
  excerpt?: string
  featuredImage?: {
    node: {
      sourceUrl: string
      altText?: string
    }
  }
  categories?: {
    nodes: {
      name: string
      slug: string
    }[]
  }
}

interface BlogGridProps {
  posts: Post[]
  loading: boolean
  error: string | null
  cleanExcerpt: (excerpt?: string) => string
  onClearFilters: () => void
}

export default function BlogGrid({ posts, loading, error, cleanExcerpt, onClearFilters }: BlogGridProps) {
  return (
    <section className="relative py-20 px-6 bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.uri}`}>
                  <PostCard post={post} excerpt={cleanExcerpt(post.excerpt)} />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <NoPostsMessage onClearFilters={onClearFilters} />
        )}
      </div>
    </section>
  )
}

const PostCard = ({ post, excerpt }: { post: Post; excerpt: string }) => {
  return (
    <div className="relative group h-full">
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 group-hover:border-cyan-400/50 transition-all duration-500"></div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

      <div className="relative h-full flex flex-col overflow-hidden rounded-3xl">
        {/* Image */}
        <div className="relative w-full h-52 overflow-hidden">
          <Image
            width={380}
            height={200}
            className="w-full h-full object-cover group-hover:scale-110 duration-500 transition-all"
            alt={post.featuredImage?.node?.altText || `Thumbnail para ${post.title}`}
            src={post.featuredImage?.node?.sourceUrl || "/placeholder.svg"}
            unoptimized
          />

          {/* Category Badge */}
          {post.categories?.nodes && post.categories.nodes.length > 0 && (
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                {post.categories.nodes[0].name}
              </span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          <h2 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all mb-3 line-clamp-2">
            {post.title}
          </h2>

          {excerpt && <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{excerpt}</p>}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center text-gray-500 text-xs bg-gray-800/50 px-3 py-1.5 rounded-full">
              <CalendarIcon size={14} className="mr-1.5" />
              <time dateTime={post.date}>{format(new Date(post.date), "d MMM, yyyy", { locale: ptBR })}</time>
            </div>

            <span className="text-cyan-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              Ler mais <ArrowUpRight size={16} className="ml-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const PostCardSkeleton = () => (
  <div className="relative h-full">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
    <div className="relative h-full flex flex-col overflow-hidden rounded-3xl animate-pulse">
      <div className="w-full h-52 bg-gray-700"></div>
      <div className="flex-1 flex flex-col p-6">
        <div className="h-7 bg-gray-700 rounded-md w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded-md w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded-md w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded-md w-2/3 mb-4"></div>
        <div className="mt-auto flex items-center justify-between">
          <div className="h-6 bg-gray-700 rounded-full w-24"></div>
          <div className="h-4 bg-gray-700 rounded-md w-16"></div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div
    className="relative max-w-md mx-auto"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-500/20 rounded-3xl blur-xl"></div>
    <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 text-center">
      <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops!</h2>
      <p className="text-red-300 mb-6">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium"
      >
        <RefreshCw size={16} />
        Tentar novamente
      </button>
    </div>
  </motion.div>
)

const NoPostsMessage = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <motion.div
    className="relative max-w-md mx-auto"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
    <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 text-center">
      <p className="text-gray-400 text-xl mb-6">Nenhum post encontrado para sua pesquisa</p>
      <button
        onClick={onClearFilters}
        className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-full hover:from-cyan-500 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg shadow-cyan-500/25"
      >
        Limpar filtros
      </button>
    </div>
  </motion.div>
)
