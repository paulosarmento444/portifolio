import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@site/integrations/wordpress", () => ({
  fetchWordpressBlogPosts: jest.fn(),
  fetchWordpressBlogPostBySlug: jest.fn(),
  fetchWordpressRelatedBlogPosts: jest.fn(),
}));

jest.mock("../components/list/blog-hero.component", () => ({
  BlogHero: () => <div data-testid="blog-hero">BLOG_HERO</div>,
}));

jest.mock("../components/list/blog-filters.component", () => ({
  BlogFilters: () => <div data-testid="blog-filters">BLOG_FILTERS</div>,
}));

jest.mock("../components/list/blog-grid.component", () => ({
  BlogGrid: ({ posts, error }: { posts: unknown[]; error: string | null }) => (
    <div>
      <span data-testid="blog-grid-count">{posts.length}</span>
      <span data-testid="blog-grid-error">{error ?? ""}</span>
    </div>
  ),
}));

jest.mock("../components/list/blog-pagination.component", () => ({
  BlogPagination: () => <div data-testid="blog-pagination">BLOG_PAGINATION</div>,
}));

jest.mock("../components/detail/post-hero.component", () => ({
  PostHero: ({ post }: { post: { title: string } }) => (
    <div data-testid="blog-post-hero">{post.title}</div>
  ),
}));

jest.mock("../components/detail/post-content.component", () => ({
  PostContent: ({ post }: { post: { title: string } }) => (
    <div data-testid="blog-post-content">{post.title}</div>
  ),
}));

jest.mock("../components/detail/related-posts.component", () => ({
  RelatedPosts: ({ posts }: { posts: Array<{ title: string }> }) => (
    <div data-testid="blog-related-count">{posts.length}</div>
  ),
}));

const wordpressBlogAdapter = jest.requireMock("@site/integrations/wordpress") as {
  fetchWordpressBlogPosts: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
  fetchWordpressBlogPostBySlug: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
  fetchWordpressRelatedBlogPosts: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
};

const { BlogListingPage } = require("./blog-listing.page") as typeof import("./blog-listing.page");
const { BlogPostPage } = require("./blog-post.page") as typeof import("./blog-post.page");

describe("blog pages", () => {
  beforeEach(() => {
    wordpressBlogAdapter.fetchWordpressBlogPosts.mockReset();
    wordpressBlogAdapter.fetchWordpressBlogPostBySlug.mockReset();
    wordpressBlogAdapter.fetchWordpressRelatedBlogPosts.mockReset();
  });

  it("renders the blog listing through the integration adapter boundary", async () => {
    wordpressBlogAdapter.fetchWordpressBlogPosts.mockResolvedValueOnce({
      items: [
        {
          id: "1",
          title: "Post 1",
          uri: "post-1/",
          slug: "post-1",
          excerpt: "Resumo",
          publishedAt: "2026-03-12T10:00:00.000Z",
          featuredImage: null,
          categories: [{ name: "Saude", slug: "saude" }],
        },
      ],
      availableCategories: [{ name: "Saude", slug: "saude" }],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: "cursor-1",
        endCursor: "cursor-2",
      },
    });

    render(<BlogListingPage />);

    expect(screen.getByTestId("blog-hero").textContent).toBe("BLOG_HERO");
    await waitFor(() => {
      expect(screen.getByTestId("blog-grid-count").textContent).toBe("1");
    });
    expect(screen.getByTestId("blog-pagination").textContent).toBe(
      "BLOG_PAGINATION",
    );
  });

  it("renders blog detail and related posts from internal contracts", async () => {
    wordpressBlogAdapter.fetchWordpressBlogPostBySlug.mockResolvedValueOnce({
      id: "post-10",
      title: "Detalhe",
      uri: "detalhe/",
      slug: "detalhe",
      excerpt: "Resumo",
      publishedAt: "2026-03-12T10:00:00.000Z",
      featuredImage: null,
      categories: [{ name: "Saude", slug: "saude" }],
      content: "<p>Conteudo</p>",
      author: { name: "Editor", avatar: null },
      relatedPosts: [],
    });
    wordpressBlogAdapter.fetchWordpressRelatedBlogPosts.mockResolvedValueOnce([
      {
        id: "post-11",
        title: "Relacionado",
        uri: "relacionado/",
        slug: "relacionado",
        excerpt: "Resumo",
        publishedAt: "2026-03-12T11:00:00.000Z",
        featuredImage: null,
        categories: [{ name: "Saude", slug: "saude" }],
      },
    ]);

    render(<BlogPostPage uri="detalhe" wordpressPublicUrl="http://localhost:8080" />);

    await waitFor(() => {
      expect(screen.getByTestId("blog-post-hero").textContent).toBe("Detalhe");
    });
    expect(screen.getByTestId("blog-post-content").textContent).toBe("Detalhe");
    expect(screen.getByTestId("blog-related-count").textContent).toBe("1");
  });
});
