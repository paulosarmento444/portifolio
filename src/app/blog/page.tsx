"use client";

import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "../lib/apolloClient";
import Header from "../components/Header";
import BlogHero from "./components/blog-hero";
import BlogFilters from "./components/blog-filters";
import BlogGrid from "./components/blog-grid";
import { Toaster } from "react-hot-toast";

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

        console.log("Resposta da API:", postsData);

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

  const cleanExcerpt = (excerpt?: string) => {
    if (!excerpt) return "";
    return excerpt.replace(/<[^>]*>/g, "").substring(0, 120) + "...";
  };

  const allCategories = Array.from(
    new Set(
      posts
        .flatMap((post) => post.categories?.nodes || [])
        .map((category) => category.name)
    )
  );

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
      <main className="min-h-screen bg-black overflow-hidden">
        <BlogHero />
        <BlogFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          allCategories={allCategories}
        />
        <BlogGrid
          posts={filteredPosts}
          loading={loading}
          error={error}
          cleanExcerpt={cleanExcerpt}
          onClearFilters={() => {
            setSearchTerm("");
            setSelectedCategory(null);
          }}
        />
      </main>
      <Toaster />
    </>
  );
}
