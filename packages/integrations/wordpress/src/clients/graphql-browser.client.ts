import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { publicEnv } from "@site/shared";

export const wordpressGraphqlBrowserClient = new ApolloClient({
  link: new HttpLink({
    uri: publicEnv.wordpressGraphqlUrl,
  }),
  cache: new InMemoryCache(),
});
