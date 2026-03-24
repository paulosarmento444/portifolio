import {
  accountPostSummaryViewSchema,
  authSessionViewSchema,
  authUserViewSchema,
  type AccountPostSummaryView,
  type AuthSessionView,
  type AuthUserView,
} from "@site/shared";
import type { WpGraphqlViewer, WpGraphqlViewerPostNode } from "../external/graphql.types";
import { normalizeLocalhostUrl, normalizeWordpressUri } from "../shared.normalize";

export const mapGraphqlViewerToAuthUserView = (
  viewer: WpGraphqlViewer,
): AuthUserView =>
  authUserViewSchema.parse({
    id: viewer.databaseId ?? viewer.id ?? 0,
    email: viewer.email ?? undefined,
    username: viewer.username ?? undefined,
    displayName: viewer.name ?? viewer.username ?? "Usuario",
    avatar: viewer.avatar?.url
      ? {
          url: normalizeLocalhostUrl(viewer.avatar.url),
          alt: viewer.name ?? undefined,
        }
      : null,
    roleLabels: (viewer.roles?.nodes ?? [])
      .map((role) => role.name ?? undefined)
      .filter((role): role is string => Boolean(role)),
  });

export const mapGraphqlViewerToAuthSessionView = (
  viewer?: WpGraphqlViewer | null,
): AuthSessionView =>
  authSessionViewSchema.parse({
    isAuthenticated: Boolean(viewer),
    user: viewer ? mapGraphqlViewerToAuthUserView(viewer) : null,
  });

export const mapGraphqlViewerPostToAccountPostSummaryView = (
  post: WpGraphqlViewerPostNode,
): AccountPostSummaryView =>
  accountPostSummaryViewSchema.parse({
    id: post.id ?? 0,
    title: post.title ?? "Post sem titulo",
    uri: normalizeWordpressUri(post.uri),
  });
