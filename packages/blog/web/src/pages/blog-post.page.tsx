"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import type { BlogPostDetailView, BlogPostSummaryView } from "@site/shared";
import { EmptyState, SectionShell, SurfaceCard } from "@site/shared";
import {
  fetchWordpressBlogPostBySlug,
  fetchWordpressRelatedBlogPosts,
} from "@site/integrations/wordpress";
import { PostContent } from "../components/detail/post-content.component";
import { PostHero } from "../components/detail/post-hero.component";
import { RelatedPosts } from "../components/detail/related-posts.component";

interface BlogPostPageProps {
  uri: string;
  wordpressPublicUrl?: string;
}

export function BlogPostPage({ uri, wordpressPublicUrl }: BlogPostPageProps) {
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

  if (loading) {
    return (
      <main className="site-page-shell site-page-shell-compact">
        <PostSkeleton />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="site-page-shell site-page-shell-compact">
        <ErrorMessage message={error || "Post não encontrado"} />
      </main>
    );
  }

  return (
    <main className="site-page-shell site-page-shell-compact">
      <>
        <PostHero post={post} />
        <PostContent post={post} wordpressPublicUrl={wordpressPublicUrl} />
        {relatedPosts.length > 0 ? <RelatedPosts posts={relatedPosts} /> : null}
      </>
    </main>
  );
}

function PostSkeleton() {
  return (
    <SectionShell container="content" spacing="hero" stack="page">
      <SurfaceCard tone="soft" padding="none" className="overflow-hidden">
        <div className="aspect-[16/9] animate-pulse bg-[color:var(--site-color-surface-inset)]" />
      </SurfaceCard>
      <SurfaceCard tone="strong" className="site-stack-section">
        <div className="h-5 w-28 animate-pulse rounded-full bg-[color:var(--site-color-surface-inset)]" />
        <div className="h-10 w-5/6 animate-pulse rounded-md bg-[color:var(--site-color-surface-inset)]" />
        <div className="h-5 w-full animate-pulse rounded-md bg-[color:var(--site-color-surface-inset)]" />
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-[color:var(--site-color-surface-inset)]" />
      </SurfaceCard>
    </SectionShell>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <SectionShell container="content" spacing="hero" stack="page">
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="Não foi possível abrir este artigo"
        description={message}
      />
    </SectionShell>
  );
}
