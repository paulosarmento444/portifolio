"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, CalendarIcon, UserIcon, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  title: string;
  date: string;
  author?: {
    node: {
      name: string;
      avatar?: {
        url: string;
      };
    };
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText?: string;
    };
  };
  categories?: {
    nodes: {
      name: string;
      slug: string;
    }[];
  };
}

interface PostHeroProps {
  post: Post;
}

export default function PostHero({ post }: PostHeroProps) {
  const router = useRouter();

  return (
    <section className="relative w-full h-[70vh] min-h-[600px] bg-black overflow-hidden">
      {/* Background Image */}
      {post.featuredImage?.node?.sourceUrl ? (
        <Image
          src={post.featuredImage.node.sourceUrl || "/placeholder.svg"}
          alt={post.featuredImage.node.altText || post.title}
          fill
          className="object-cover opacity-40"
          priority
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20" />
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 relative h-full flex flex-col justify-end pb-16 pt-24">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push("/blog")}
          className="absolute top-8 left-6 flex items-center text-white/80 hover:text-white transition-all duration-300 bg-gray-900/50 hover:bg-gray-800/80 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-700/50 hover:border-cyan-400/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChevronLeft size={18} className="mr-1" />
          Voltar para o Blog
        </motion.button>

        {/* Categories */}
        {post.categories?.nodes && post.categories.nodes.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {post.categories.nodes.map((category, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-cyan-400/90 to-purple-500/90 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center backdrop-blur-sm shadow-lg"
              >
                <Tag size={14} className="mr-2" />
                {category.name}
              </span>
            ))}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
            {post.title}
          </span>
        </motion.h1>

        {/* Meta Information */}
        <motion.div
          className="flex flex-wrap items-center gap-6 text-sm text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {post.author?.node && (
            <div className="flex items-center gap-3 bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-700/50">
              {post.author.node.avatar?.url ? (
                <Image
                  src={post.author.node.avatar.url || "/placeholder.svg"}
                  alt={post.author.node.name}
                  width={28}
                  height={28}
                  className="rounded-full border-2 border-cyan-400/50"
                  unoptimized
                />
              ) : (
                <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <UserIcon size={16} className="text-white" />
                </div>
              )}
              <span className="font-medium">{post.author.node.name}</span>
            </div>
          )}

          {post.date && (
            <div className="flex items-center gap-3 bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-700/50">
              <CalendarIcon size={18} className="text-cyan-400" />
              <time dateTime={post.date} className="font-medium">
                {format(new Date(post.date), "d 'de' MMMM, yyyy", {
                  locale: ptBR,
                })}
              </time>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
