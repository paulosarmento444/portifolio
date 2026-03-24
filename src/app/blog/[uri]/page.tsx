import { publicEnv } from "@/app/lib/env.public";
import { BlogPostPage } from "@site/blog";

const readOptionalWordpressPublicUrl = () => {
  try {
    return publicEnv.wordpressPublicUrl;
  } catch {
    return undefined;
  }
};

export default function BlogPostRoute({
  params: { uri },
}: {
  params: { uri: string };
}) {
  return (
    <BlogPostPage
      uri={uri}
      wordpressPublicUrl={readOptionalWordpressPublicUrl()}
    />
  );
}
