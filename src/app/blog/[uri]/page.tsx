"use client";

import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "@/app/lib/apolloClient";
import Header from "@/app/components/Header";
import PostHero from "../components/post-hero";
import PostContent from "../components/post-content";
import RelatedPosts from "../components/related-posts";
import { Toaster } from "react-hot-toast";
import { useParams } from "next/navigation";

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
  const uri = params?.uri as string;

  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [uri]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black mt-20">
        {loading ? (
          <div className="pt-20">
            <PostSkeleton />
          </div>
        ) : error ? (
          <div className="pt-20">
            <ErrorMessage message={error} />
          </div>
        ) : post ? (
          <>
            <PostHero post={post} />
            <PostContent post={post} />
            {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
          </>
        ) : (
          <div className="pt-20">
            <ErrorMessage message="Post não encontrado" />
          </div>
        )}
      </main>
      <Toaster />
    </>
  );
}

const PostSkeleton = () => (
  <div className="space-y-8 px-6">
    <div className="h-[60vh] bg-gray-800 w-full rounded-b-3xl relative animate-pulse">
      <div className="absolute bottom-0 left-0 w-full p-8 space-y-4 max-w-4xl mx-auto">
        <div className="h-6 bg-gray-700 rounded-full w-32"></div>
        <div className="h-10 bg-gray-700 rounded-xl w-3/4"></div>
        <div className="h-10 bg-gray-700 rounded-xl w-full"></div>
        <div className="flex gap-4">
          <div className="h-8 bg-gray-700 rounded-full w-32"></div>
          <div className="h-8 bg-gray-700 rounded-full w-40"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="max-w-4xl mx-auto px-6 py-20">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-500/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 text-center">
        <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops!</h2>
        <p className="text-red-300 mb-6">{message}</p>
      </div>
    </div>
  </div>
);
