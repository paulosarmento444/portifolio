export type WpGraphqlMediaNode = {
  sourceUrl?: string | null;
  altText?: string | null;
};

export type WpGraphqlMediaEdge = {
  node?: WpGraphqlMediaNode | null;
};

export type WpGraphqlCategoryNode = {
  name?: string | null;
  slug?: string | null;
};

export type WpGraphqlAuthorNode = {
  name?: string | null;
  avatar?: {
    url?: string | null;
  } | null;
};

export type WpGraphqlPostNode = {
  id?: string | null;
  title?: string | null;
  uri?: string | null;
  date?: string | null;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: WpGraphqlMediaEdge | null;
  categories?: {
    nodes?: WpGraphqlCategoryNode[] | null;
  } | null;
  author?: {
    node?: WpGraphqlAuthorNode | null;
  } | null;
};

export type WpGraphqlPageInfo = {
  hasNextPage?: boolean | null;
  hasPreviousPage?: boolean | null;
  startCursor?: string | null;
  endCursor?: string | null;
};

export type WpGraphqlViewerPostNode = {
  id?: string | null;
  title?: string | null;
  uri?: string | null;
};

export type WpGraphqlViewer = {
  id?: string | null;
  databaseId?: number | null;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  avatar?: {
    url?: string | null;
  } | null;
  roles?: {
    nodes?: Array<{ name?: string | null }> | null;
  } | null;
  posts?: {
    nodes?: WpGraphqlViewerPostNode[] | null;
  } | null;
};
