import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { publicEnv } from "@/app/lib/env.public";

export const wordpressGraphqlBrowserClient = new ApolloClient({
  link: new HttpLink({
    uri: publicEnv.wordpressGraphqlUrl,
  }),
  cache: new InMemoryCache(),
});
