import {
  blogAuthorViewSchema,
  blogCategoryViewSchema,
  blogPostDetailViewSchema,
  blogPostSummaryViewSchema,
  type BlogAuthorView,
  type BlogCategoryView,
  type BlogPostDetailView,
  type BlogPostSummaryView,
} from "@site/shared";
import type {
  WpGraphqlAuthorNode,
  WpGraphqlCategoryNode,
  WpGraphqlPostNode,
} from "../external/graphql.types";
import { normalizeLocalhostUrl, normalizeWordpressUri } from "../shared.normalize";

const mapCategory = (category: WpGraphqlCategoryNode): BlogCategoryView =>
  blogCategoryViewSchema.parse({
    name: category.name ?? "Categoria",
    slug: category.slug ?? "categoria",
  });

const mapAuthor = (author?: WpGraphqlAuthorNode | null): BlogAuthorView | null => {
  if (!author?.name) {
    return null;
  }

  return blogAuthorViewSchema.parse({
    name: author.name,
    avatar: author.avatar?.url
      ? {
          url: normalizeLocalhostUrl(author.avatar.url),
        }
      : null,
  });
};

export const mapGraphqlPostToBlogPostSummaryView = (
  post: WpGraphqlPostNode,
): BlogPostSummaryView =>
  blogPostSummaryViewSchema.parse({
    id: post.id ?? undefined,
    title: post.title ?? "Post sem titulo",
    uri: normalizeWordpressUri(post.uri),
    slug: normalizeWordpressUri(post.uri).split("/").filter(Boolean).pop(),
    excerpt: post.excerpt ?? undefined,
    publishedAt: post.date ?? new Date(0).toISOString(),
    featuredImage: post.featuredImage?.node?.sourceUrl
      ? {
          url: normalizeLocalhostUrl(post.featuredImage.node.sourceUrl),
          alt: post.featuredImage.node.altText ?? undefined,
        }
      : null,
    categories: (post.categories?.nodes ?? []).map(mapCategory),
  });

export const mapGraphqlPostToBlogPostDetailView = (
  post: WpGraphqlPostNode,
): BlogPostDetailView =>
  blogPostDetailViewSchema.parse({
    ...mapGraphqlPostToBlogPostSummaryView(post),
    content: post.content ?? "",
    author: mapAuthor(post.author?.node),
    relatedPosts: [],
  });
