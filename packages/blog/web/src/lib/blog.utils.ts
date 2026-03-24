import type { BlogPostSummaryView } from "@site/shared";

export const BLOG_POSTS_PER_PAGE = 9;

export const cleanBlogExcerpt = (excerpt?: string) => {
  if (!excerpt) {
    return "";
  }

  const text = excerpt.replace(/<[^>]*>/g, "").trim();
  if (text.length <= 120) {
    return text;
  }

  return `${text.slice(0, 120)}...`;
};

export const isBlogWebStoryContent = (content?: string) =>
  /<amp-story|class=["']web-stories|<iframe[^>]+stories/i.test(content || "");

export const buildStoryEmbedUrl = (
  content: string,
  wordpressPublicUrl?: string,
) => {
  const hrefMatch = content.match(/href=["']([^"']*web-stories[^"']*)["']/i);
  const srcMatch = content.match(/src=["']([^"']*web-stories[^"']*)["']/i);
  const storyUrl = hrefMatch?.[1] || srcMatch?.[1] || "";

  if (!storyUrl) {
    return "";
  }

  let url = storyUrl.trim();
  if (url.startsWith("/") && wordpressPublicUrl) {
    url = `${wordpressPublicUrl.replace(/\/$/, "")}${url}`;
  }

  const canonical = url
    .replace(/\/?embed\/?(\?.*)?$/i, "/")
    .replace(/\/?$/, "/");
  const separator = canonical.includes("?") ? "&" : "?";

  return `${canonical}${separator}output=embed&mute=1&playsinline=1#amp=1`;
};

export const getBlogCategories = (posts: BlogPostSummaryView[]) =>
  Array.from(
    new Map(
      posts
        .flatMap((post) => post.categories)
        .map((category) => [category.slug, category.name] as const),
    ).values(),
  );
