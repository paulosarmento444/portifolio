import { gql } from "@apollo/client";
import type {
  BlogCategoryView,
  BlogPostDetailView,
  BlogPostSummaryView,
} from "@site/shared";
import { wordpressGraphqlBrowserClient } from "./clients/graphql-browser.client";
import type { WpGraphqlPageInfo, WpGraphqlPostNode } from "./external/graphql.types";
import {
  mapGraphqlPostToBlogPostDetailView,
  mapGraphqlPostToBlogPostSummaryView,
} from "./mappers/blog.mapper";

const GET_BLOG_POSTS = gql`
  query GetWordpressBlogPosts($first: Int, $after: String) {
    posts(first: $first, after: $after) {
      nodes {
        id
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
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const GET_BLOG_POST = gql`
  query GetWordpressBlogPost($id: ID!) {
    post(id: $id, idType: SLUG) {
      id
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

const GET_RELATED_BLOG_POSTS = gql`
  query GetWordpressRelatedPosts($categoryIn: [ID], $notIn: ID) {
    posts(first: 3, where: { categoryIn: $categoryIn, notIn: [$notIn] }) {
      nodes {
        id
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

const REGISTER_WORDPRESS_USER = gql`
  mutation RegisterWordpressUser(
    $username: String!
    $password: String!
    $email: String!
  ) {
    registerUser(
      input: { username: $username, password: $password, email: $email }
    ) {
      clientMutationId
      user {
        name
        slug
      }
    }
  }
`;

export type WordpressBlogListingQuery = {
  first?: number;
  after?: string | null;
};

export type WordpressCursorPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export type WordpressBlogListingResult = {
  items: BlogPostSummaryView[];
  availableCategories: BlogCategoryView[];
  pageInfo: WordpressCursorPageInfo;
};

export type WordpressRegisterUserInput = {
  username: string;
  password: string;
  email: string;
};

export type WordpressRegisterUserResult = {
  displayName?: string;
  slug?: string;
};

const mapPageInfo = (pageInfo?: WpGraphqlPageInfo | null): WordpressCursorPageInfo => ({
  hasNextPage: Boolean(pageInfo?.hasNextPage),
  hasPreviousPage: Boolean(pageInfo?.hasPreviousPage),
  startCursor: pageInfo?.startCursor ?? null,
  endCursor: pageInfo?.endCursor ?? null,
});

export const fetchWordpressBlogPosts = async (
  query: WordpressBlogListingQuery = {},
): Promise<WordpressBlogListingResult> => {
  const { data } = await wordpressGraphqlBrowserClient.query<{
    posts?: {
      nodes?: WpGraphqlPostNode[] | null;
      pageInfo?: WpGraphqlPageInfo | null;
    } | null;
  }>({
    query: GET_BLOG_POSTS,
    variables: {
      first: query.first ?? 9,
      after: query.after ?? null,
    },
    fetchPolicy: "network-only",
  });

  const items = (data.posts?.nodes ?? []).map(mapGraphqlPostToBlogPostSummaryView);
  const availableCategories = Array.from(
    new Map(
      items
        .flatMap((item) => item.categories)
        .map((category) => [category.slug, category] as const),
    ).values(),
  );

  return {
    items,
    availableCategories,
    pageInfo: mapPageInfo(data.posts?.pageInfo),
  };
};

export const fetchWordpressBlogPostBySlug = async (
  slug: string,
): Promise<BlogPostDetailView | null> => {
  const { data } = await wordpressGraphqlBrowserClient.query<{
    post?: WpGraphqlPostNode | null;
  }>({
    query: GET_BLOG_POST,
    variables: { id: slug },
    fetchPolicy: "network-only",
  });

  if (!data.post) {
    return null;
  }

  return mapGraphqlPostToBlogPostDetailView(data.post);
};

export const fetchWordpressRelatedBlogPosts = async (
  categorySlugs: string[],
  postId: string,
): Promise<BlogPostSummaryView[]> => {
  const { data } = await wordpressGraphqlBrowserClient.query<{
    posts?: {
      nodes?: WpGraphqlPostNode[] | null;
    } | null;
  }>({
    query: GET_RELATED_BLOG_POSTS,
    variables: {
      categoryIn: categorySlugs,
      notIn: postId,
    },
    fetchPolicy: "network-only",
  });

  return (data.posts?.nodes ?? []).map(mapGraphqlPostToBlogPostSummaryView);
};

export const registerWordpressUser = async (
  input: WordpressRegisterUserInput,
): Promise<WordpressRegisterUserResult> => {
  const { data } = await wordpressGraphqlBrowserClient.mutate<{
    registerUser?: {
      user?: {
        name?: string | null;
        slug?: string | null;
      } | null;
    } | null;
  }>({
    mutation: REGISTER_WORDPRESS_USER,
    variables: input,
  });

  return {
    displayName: data?.registerUser?.user?.name ?? undefined,
    slug: data?.registerUser?.user?.slug ?? undefined,
  };
};

export { wordpressGraphqlBrowserClient };
