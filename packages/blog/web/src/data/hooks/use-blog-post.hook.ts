"use client";

import { useEffect, useState } from "react";
import type { BlogPostDetailView, BlogPostSummaryView } from "@site/shared";
import {
  fetchWordpressBlogPostBySlug,
  fetchWordpressRelatedBlogPosts,
} from "@site/integrations/wordpress";

export function useBlogPost(uri: string) {
  const [post, setPost] = useState<BlogPostDetailView | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!uri) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setPost(null);
        setRelatedPosts([]);

        const postData = await fetchWordpressBlogPostBySlug(uri);

        if (!postData) {
          setError("Post não encontrado");
          return;
        }

        setPost(postData);

        if (postData.categories.length > 0 && postData.id) {
          try {
            const related = await fetchWordpressRelatedBlogPosts(
              postData.categories.map((category) => category.slug),
              postData.id,
            );
            setRelatedPosts(related);
          } catch (relatedPostsError) {
            console.error("Error fetching related posts:", relatedPostsError);
            setRelatedPosts([]);
          }
        }
      } catch (fetchError) {
        console.error("Error fetching post:", fetchError);
        setError("Erro ao carregar o post. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    void fetchPost();
  }, [uri]);

  return {
    post,
    relatedPosts,
    loading,
    error,
  };
}
