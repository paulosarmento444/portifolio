"use client";

import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "../lib/apolloClient";
import Header from "../components/Header";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpAnimation } from "../lib/animations";
import { CalendarIcon, Search, Tag, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  title: string;
  content: string;
  uri: string;
  date: string;
  excerpt?: string;
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

const GET_POSTS = gql`
  query GetAllPosts {
    posts {
      nodes {
        title
        uri
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await apolloClient.query({
          query: GET_POSTS,
          fetchPolicy: "network-only",
        });

        // Formatando os URIs dos posts
        const postsData =
          data?.posts?.nodes.map((post: any) => {
            let formattedUri = post.uri;
            if (formattedUri.startsWith("/")) {
              formattedUri = formattedUri.substring(1);
            }
            if (formattedUri.startsWith("blog/")) {
              formattedUri = formattedUri.substring(5);
            }
            return {
              ...post,
              uri: formattedUri,
            };
          }) || [];

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Falha ao carregar os posts. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Função para limpar o HTML do excerpt
  const cleanExcerpt = (excerpt?: string) => {
    if (!excerpt) return "";
    return excerpt.replace(/<[^>]*>/g, "").substring(0, 120) + "...";
  };

  // Extrair todas as categorias únicas
  const allCategories = Array.from(
    new Set(
      posts
        .flatMap((post) => post.categories?.nodes || [])
        .map((category) => category.name)
    )
  );

  // Filtrar posts com base na pesquisa e categoria
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt &&
        cleanExcerpt(post.excerpt)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === null ||
      post.categories?.nodes.some(
        (category) => category.name === selectedCategory
      );

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Blog
            </motion.h1>
            <motion.p
              className="text-gray-400 max-w-2xl mx-auto text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Confira nossos artigos mais recentes sobre tecnologia,
              desenvolvimento e muito mais.
            </motion.p>
          </div>

          {/* Filtros e Pesquisa */}
          <motion.div
            className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="Pesquisar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-lime-500 text-gray-900"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </button>
              {allCategories.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
                    selectedCategory === category
                      ? "bg-lime-500 text-gray-900"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <Tag size={12} className="mr-1" />
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={i}
                  {...fadeUpAnimation}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {/* Aqui está a mudança: adicionando "blog/" ao href */}
                  <Link href={`/blog/${post.uri}`}>
                    <PostCard
                      post={post}
                      excerpt={cleanExcerpt(post.excerpt)}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-400 text-xl mb-4">
                  Nenhum post encontrado para sua pesquisa
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-600 transition-colors font-medium"
                >
                  Limpar filtros
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

type PostCardProps = {
  post: Post;
  excerpt: string;
};

const PostCard = ({ post, excerpt }: PostCardProps) => {
  return (
    <div className="rounded-xl h-full flex flex-col bg-gray-800 overflow-hidden group transition-all border border-gray-700 hover:border-lime-500 shadow-lg hover:shadow-lime-500/10">
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          width={380}
          height={200}
          className="w-full h-full object-cover group-hover:scale-110 duration-500 transition-all"
          alt={
            post.featuredImage?.node?.altText || `Thumbnail para ${post.title}`
          }
          src={post.featuredImage?.node?.sourceUrl || "/placeholder.svg"}
          unoptimized
        />
        {post.categories?.nodes && post.categories.nodes.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-lime-500 text-gray-900 text-xs font-medium px-3 py-1 rounded-full">
              {post.categories.nodes[0].name}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-6">
        <h2 className="font-bold text-xl text-white group-hover:text-lime-400 transition-all mb-3 line-clamp-2">
          {post.title}
        </h2>

        {excerpt && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">{excerpt}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-xs">
            <CalendarIcon size={14} className="mr-1" />
            <time dateTime={post.date}>
              {format(new Date(post.date), "d MMM, yyyy", { locale: ptBR })}
            </time>
          </div>

          <span className="text-lime-500 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            Ler mais <ArrowUpRight size={14} className="ml-1" />
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente de esqueleto para carregamento
const PostCardSkeleton = () => (
  <div className="rounded-xl h-full flex flex-col bg-gray-800 overflow-hidden animate-pulse shadow-lg border border-gray-700">
    <div className="w-full h-52 bg-gray-700"></div>
    <div className="flex-1 flex flex-col p-6">
      <div className="h-7 bg-gray-700 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-gray-700 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-gray-700 rounded-md w-2/3 mb-4"></div>
      <div className="mt-auto flex items-center justify-between">
        <div className="h-3 bg-gray-700 rounded-md w-24"></div>
        <div className="h-3 bg-gray-700 rounded-md w-16"></div>
      </div>
    </div>
  </div>
);

// Componente de mensagem de erro
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-900/20 border border-red-800 rounded-xl p-8 text-center max-w-md mx-auto">
    <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops!</h2>
    <p className="text-red-300 mb-4">{message}</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
    >
      Tentar novamente
    </button>
  </div>
);
