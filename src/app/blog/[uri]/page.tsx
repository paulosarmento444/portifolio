"use client";

import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "@/app/lib/apolloClient";
import Header from "@/app/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarIcon,
  UserIcon,
  ChevronLeft,
  Tag,
  Share2,
  Bookmark,
  ArrowUp,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

// Interface mais completa para o post
interface Post {
  title: string;
  content: string;
  uri: string;
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

interface RelatedPost {
  title: string;
  uri: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
}

// Query GraphQL melhorada para buscar posts por slug em vez de URI
const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id, idType: SLUG) {
      title
      content
      uri
      date
      author {
        node {
          name
          avatar {
            url
          }
        }
      }
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
`;

// Query para posts relacionados
const GET_RELATED_POSTS = gql`
  query GetRelatedPosts($categoryIn: [ID], $notIn: ID) {
    posts(first: 3, where: { categoryIn: $categoryIn, notIn: [$notIn] }) {
      nodes {
        title
        uri
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const uri = params?.uri as string;

  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!uri) return;

      try {
        setLoading(true);
        console.log("Buscando post com slug:", uri);

        const { data } = await apolloClient.query({
          query: GET_POST,
          variables: { id: uri },
          fetchPolicy: "network-only",
        });

        console.log("Resposta da API:", data);

        if (data.post) {
          setPost(data.post);

          // Fetch related posts if we have categories
          if (data.post.categories?.nodes?.length > 0) {
            const categoryIds = data.post.categories.nodes.map(
              (cat: any) => cat.slug
            );
            fetchRelatedPosts(categoryIds, data.post.id);
          }
        } else {
          setError("Post não encontrado");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Erro ao carregar o post. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedPosts = async (categoryIn: string[], postId: string) => {
      try {
        const { data } = await apolloClient.query({
          query: GET_RELATED_POSTS,
          variables: { categoryIn, notIn: postId },
        });

        if (data.posts?.nodes) {
          // Formatando os URIs dos posts relacionados
          const formattedPosts = data.posts.nodes.map((post: any) => {
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
          });

          setRelatedPosts(formattedPosts);
        }
      } catch (err) {
        console.error("Error fetching related posts:", err);
      }
    };

    fetchPost();

    // Adicionar listener para o scroll
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [uri]);

  // Função para compartilhar o post
  const sharePost = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title || "Artigo interessante",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Error copying:", err));
    }
  };

  // Função para copiar o link
  const copyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Error copying:", err));
  };

  // Função para voltar ao topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-20 pb-16">
        {loading ? (
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <PostSkeleton />
          </div>
        ) : error ? (
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <ErrorMessage message={error} />
          </div>
        ) : post ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero section with featured image */}
            <div className="relative w-full h-[60vh] min-h-[500px] bg-gray-900">
              {post.featuredImage?.node?.sourceUrl ? (
                <Image
                  src={post.featuredImage.node.sourceUrl || "/placeholder.svg"}
                  alt={post.featuredImage.node.altText || post.title}
                  fill
                  className="object-cover opacity-50"
                  priority
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

              <div className="container max-w-4xl mx-auto px-4 sm:px-6 relative h-full flex flex-col justify-end pb-16">
                <motion.button
                  onClick={() => router.push("/blog")}
                  className="absolute top-8 left-4 sm:left-6 flex items-center text-white/80 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800/80 px-4 py-2 rounded-full backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Voltar para o Blog
                </motion.button>

                {/* Categorias */}
                {post.categories?.nodes && post.categories.nodes.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {post.categories.nodes.map((category, index) => (
                      <span
                        key={index}
                        className="bg-lime-500/90 text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full flex items-center"
                      >
                        <Tag size={12} className="mr-1.5" />
                        {category.name}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Título */}
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {post.title}
                </motion.h1>

                {/* Metadados do post */}
                <motion.div
                  className="flex flex-wrap items-center gap-4 text-sm text-white/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {post.author?.node && (
                    <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {post.author.node.avatar?.url ? (
                        <Image
                          src={
                            post.author.node.avatar.url || "/placeholder.svg"
                          }
                          alt={post.author.node.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <UserIcon size={16} />
                      )}
                      <span>{post.author.node.name}</span>
                    </div>
                  )}

                  {post.date && (
                    <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <CalendarIcon size={16} />
                      <time dateTime={post.date}>
                        {format(new Date(post.date), "d 'de' MMMM, yyyy", {
                          locale: ptBR,
                        })}
                      </time>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="container max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
              <motion.article
                className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {/* Ações do post */}
                <div className="flex justify-between p-4 border-b border-gray-700">
                  <div className="flex gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        window.location.href
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-blue-600 transition-colors"
                      aria-label="Compartilhar no Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        window.location.href
                      )}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-sky-500 transition-colors"
                      aria-label="Compartilhar no Twitter"
                    >
                      <Twitter size={18} />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        window.location.href
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-blue-700 transition-colors"
                      aria-label="Compartilhar no LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                    <button
                      onClick={copyLink}
                      className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors relative"
                      aria-label="Copiar link"
                    >
                      {copied ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} />
                      )}
                      {copied && (
                        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                          Link copiado!
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={sharePost}
                      className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      aria-label="Compartilhar"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      aria-label="Salvar"
                    >
                      <Bookmark size={18} />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do post */}
                <div className="p-6 sm:p-8">
                  <div
                    className="prose prose-lg max-w-none prose-invert prose-headings:text-white prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-300 prose-a:text-lime-400 hover:prose-a:text-lime-300 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-strong:text-white prose-blockquote:border-lime-500 prose-blockquote:bg-gray-900/50 prose-blockquote:py-1 prose-blockquote:italic"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              </motion.article>

              {/* Posts relacionados */}
              {relatedPosts.length > 0 && (
                <motion.div
                  className="mt-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                    <span className="w-8 h-1 bg-lime-500 rounded-full mr-3"></span>
                    Posts Relacionados
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost, index) => (
                      // Aqui está a mudança: adicionando "blog/" ao href
                      <Link href={`/blog/${relatedPost.uri}`} key={index}>
                        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-700 hover:border-lime-500 group">
                          <div className="h-40 relative">
                            <Image
                              src={
                                relatedPost.featuredImage?.node?.sourceUrl ||
                                "/placeholder.svg"
                              }
                              alt={relatedPost.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-white line-clamp-2 group-hover:text-lime-400 transition-colors">
                              {relatedPost.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Botão de voltar ao topo */}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 bg-lime-500 text-gray-900 p-3 rounded-full shadow-lg hover:bg-lime-400 transition-colors z-50"
                aria-label="Voltar ao topo"
              >
                <ArrowUp size={20} />
              </button>
            )}
          </motion.div>
        ) : (
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <ErrorMessage message="Post não encontrado" />
          </div>
        )}
      </main>
    </>
  );
}

// Componente de esqueleto para carregamento
const PostSkeleton = () => (
  <div className="space-y-8">
    <div className="h-[500px] bg-gray-800 w-full rounded-b-xl relative">
      <div className="absolute bottom-0 left-0 w-full p-8 space-y-4">
        <div className="h-6 bg-gray-700 rounded-full w-32"></div>
        <div className="h-10 bg-gray-700 rounded-xl w-3/4"></div>
        <div className="h-10 bg-gray-700 rounded-xl w-full"></div>
        <div className="flex gap-4">
          <div className="h-8 bg-gray-700 rounded-full w-32"></div>
          <div className="h-8 bg-gray-700 rounded-full w-40"></div>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-700">
      <div className="h-12 bg-gray-700 w-full"></div>
      <div className="p-6 sm:p-8 space-y-4">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-40 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

// Componente de mensagem de erro
const ErrorMessage = ({ message }: { message: string }) => {
  const router = useRouter();
  return (
    <div className="bg-red-900/20 border border-red-800 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops!</h2>
      <p className="text-red-300 mb-4">{message}</p>
      <button
        onClick={() => router.push("/blog")}
        className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Voltar para o Blog
      </button>
    </div>
  );
};
