import "server-only";
import { gql } from "@apollo/client";
import { getAuthClient } from "@faustwp/experimental-app-router";
import type {
  AccountPostSummaryView,
  AuthSessionView,
  AuthUserView,
} from "@site/shared";
import type { WpGraphqlViewer } from "./external/graphql.types";
import {
  mapGraphqlViewerPostToAccountPostSummaryView,
  mapGraphqlViewerToAuthSessionView,
  mapGraphqlViewerToAuthUserView,
} from "./mappers/auth.mapper";

const VIEWER_QUERY = gql`
  query GetWordpressViewer {
    viewer {
      id
      databaseId
      name
      email
      username
      avatar {
        url
      }
      roles {
        nodes {
          name
        }
      }
      posts {
        nodes {
          id
          title
          uri
        }
      }
    }
  }
`;

export type WordpressViewerSummary = {
  databaseId: number;
  user: AuthUserView;
  posts: AccountPostSummaryView[];
};

const getViewerRaw = async (): Promise<WpGraphqlViewer | null> => {
  const client = await getAuthClient();

  if (!client) {
    return null;
  }

  const { data } = await client.query<{ viewer?: WpGraphqlViewer | null }>({
    query: VIEWER_QUERY,
    fetchPolicy: "network-only",
  });

  return data.viewer ?? null;
};

export const wordpressFaustAdapter = {
  getSession: async (): Promise<AuthSessionView> => {
    const viewer = await getViewerRaw();
    return mapGraphqlViewerToAuthSessionView(viewer);
  },

  getViewer: async (): Promise<AuthUserView | null> => {
    const viewer = await getViewerRaw();
    return viewer ? mapGraphqlViewerToAuthUserView(viewer) : null;
  },

  getViewerSummary: async (): Promise<WordpressViewerSummary | null> => {
    const viewer = await getViewerRaw();

    if (!viewer) {
      return null;
    }

    return {
      databaseId: viewer.databaseId ?? Number(viewer.id ?? 0),
      user: mapGraphqlViewerToAuthUserView(viewer),
      posts: (viewer.posts?.nodes ?? []).map(mapGraphqlViewerPostToAccountPostSummaryView),
    };
  },
};
