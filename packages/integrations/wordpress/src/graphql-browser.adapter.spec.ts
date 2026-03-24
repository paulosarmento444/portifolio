import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("./clients/graphql-browser.client", () => ({
  wordpressGraphqlBrowserClient: {
    query: jest.fn(),
    mutate: jest.fn(),
  },
}));

const { wordpressGraphqlBrowserClient } = require("./clients/graphql-browser.client") as {
  wordpressGraphqlBrowserClient: {
    query: jest.Mock;
    mutate: jest.Mock;
  };
};

const {
  fetchWordpressBlogPostBySlug,
  fetchWordpressBlogPosts,
  fetchWordpressRelatedBlogPosts,
  registerWordpressUser,
} = require("./graphql-browser.adapter") as typeof import("./graphql-browser.adapter");

describe("graphql-browser.adapter", () => {
  beforeEach(() => {
    wordpressGraphqlBrowserClient.query.mockReset();
    wordpressGraphqlBrowserClient.mutate.mockReset();
  });

  it("maps blog listing data into internal blog contracts and deduplicates categories", async () => {
    (wordpressGraphqlBrowserClient.query as any).mockResolvedValueOnce({
      data: {
        posts: {
          nodes: [
            {
              id: "post-1",
              title: "Post 1",
              uri: "/blog/post-1/",
              date: "2026-03-10T10:00:00.000Z",
              excerpt: "<p>Resumo 1</p>",
              featuredImage: {
                node: {
                  sourceUrl: "https://localhost:8080/post-1.jpg",
                  altText: "Post 1",
                },
              },
              categories: {
                nodes: [{ name: "Saude", slug: "saude" }],
              },
            },
            {
              id: "post-2",
              title: "Post 2",
              uri: "/blog/post-2/",
              date: "2026-03-11T10:00:00.000Z",
              excerpt: "<p>Resumo 2</p>",
              categories: {
                nodes: [
                  { name: "Saude", slug: "saude" },
                  { name: "Noticias", slug: "noticias" },
                ],
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: "cursor-1",
            endCursor: "cursor-2",
          },
        },
      },
    });

    const result = await fetchWordpressBlogPosts({
      first: 2,
      after: "cursor-0",
    });

    expect(wordpressGraphqlBrowserClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          first: 2,
          after: "cursor-0",
        },
      }),
    );
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      title: "Post 1",
      uri: "post-1/",
    });
    expect(result.items[0].featuredImage?.url).toBe(
      "http://localhost:8080/post-1.jpg",
    );
    expect(result.availableCategories).toEqual([
      { name: "Saude", slug: "saude" },
      { name: "Noticias", slug: "noticias" },
    ]);
    expect(result.pageInfo).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: "cursor-1",
      endCursor: "cursor-2",
    });
  });

  it("maps blog detail, related posts and register mutation through internal contracts", async () => {
    (wordpressGraphqlBrowserClient.query as any)
      .mockResolvedValueOnce({
        data: {
          post: {
            id: "post-10",
            title: "Detalhe",
            content: "<p>Conteudo</p>",
            uri: "/blog/detalhe/",
            date: "2026-03-12T10:00:00.000Z",
            author: {
              node: {
                name: "Editor",
                avatar: {
                  url: "https://localhost:8080/avatar.jpg",
                },
              },
            },
            categories: {
              nodes: [{ name: "Saude", slug: "saude" }],
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          posts: {
            nodes: [
              {
                id: "post-11",
                title: "Relacionado",
                uri: "/blog/relacionado/",
                date: "2026-03-12T11:00:00.000Z",
                excerpt: "<p>Relacionado</p>",
                categories: {
                  nodes: [{ name: "Saude", slug: "saude" }],
                },
              },
            ],
          },
        },
      });

    (wordpressGraphqlBrowserClient.mutate as any).mockResolvedValueOnce({
      data: {
        registerUser: {
          user: {
            name: "Maria",
            slug: "maria",
          },
        },
      },
    });

    const post = await fetchWordpressBlogPostBySlug("detalhe");
    const related = await fetchWordpressRelatedBlogPosts(["saude"], "post-10");
    const registerResult = await registerWordpressUser({
      username: "maria",
      password: "password-123",
      email: "maria@example.com",
    });

    expect(post).toMatchObject({
      title: "Detalhe",
      uri: "detalhe/",
      author: {
        name: "Editor",
      },
    });
    expect(post?.author?.avatar?.url).toBe("http://localhost:8080/avatar.jpg");
    expect(related).toHaveLength(1);
    expect(related[0]).toMatchObject({
      title: "Relacionado",
      uri: "relacionado/",
    });
    expect(registerResult).toEqual({
      displayName: "Maria",
      slug: "maria",
    });
  });
});
