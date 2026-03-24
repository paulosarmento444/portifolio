import type { BlogPostSummaryView } from "@site/shared";
import { PageHeader, SectionShell } from "@site/shared";
import { BlogPostCard } from "../shared/blog-post-card.component";

interface RelatedPostsProps {
  posts: BlogPostSummaryView[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <SectionShell container="commerce" spacing="default" stack="page">
      <PageHeader
        container="commerce"
        className="px-0 pt-0"
        compact
        eyebrow="Continue lendo"
        title="Posts relacionados"
        description="Mais conteúdo alinhado aos mesmos temas deste artigo."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <BlogPostCard
            key={post.id ?? index}
            post={post}
            compact
            showExcerpt={false}
          />
        ))}
      </div>
    </SectionShell>
  );
}
