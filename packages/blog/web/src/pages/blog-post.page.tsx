"use client";

import { BookOpen } from "lucide-react";
import { EmptyState, SectionShell, SurfaceCard } from "@site/shared";
import { PostContent } from "../components/detail/post-content.component";
import { PostHero } from "../components/detail/post-hero.component";
import { RelatedPosts } from "../components/detail/related-posts.component";
import { useBlogPost } from "../data/hooks/use-blog-post.hook";

interface BlogPostPageProps {
  uri: string;
  wordpressPublicUrl?: string;
}

export function BlogPostPage({ uri, wordpressPublicUrl }: BlogPostPageProps) {
  const { post, relatedPosts, loading, error } = useBlogPost(uri);

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
